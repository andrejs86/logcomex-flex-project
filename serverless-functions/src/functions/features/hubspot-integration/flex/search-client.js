const axios = require('axios');

const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

const OBJECTS_URL = `/crm/v3/objects`;

function correctPhoneNumber(phoneNumber) {
  let cPhoneNumber = phoneNumber;
  try {
    const regex = /[0-9]/gm;
    cPhoneNumber = cPhoneNumber.match(regex)?.join('');
    if (!cPhoneNumber) return phoneNumber;

    // USA
    if (cPhoneNumber.startsWith('1')) {
      const countryCode = '+1';
      const regionalCode = cPhoneNumber.substring(1, 4);
      const position = cPhoneNumber.substring(4).length - 4;
      const number = `${cPhoneNumber.substring(4).slice(0, position)}-${cPhoneNumber.substring(4).slice(position)}`;
      cPhoneNumber = `${countryCode} (${regionalCode}) ${number}`;
    }

    // Brazil
    if (cPhoneNumber.startsWith('55')) {
      const countryCode = '+55';
      const regionalCode = cPhoneNumber.substring(2, 4);
      const position = cPhoneNumber.substring(4).length - 4;
      const number = `${cPhoneNumber.substring(4).slice(0, position)}-${cPhoneNumber.substring(4).slice(position)}`;
      cPhoneNumber = `${countryCode} (${regionalCode}) ${number}`;
    }
  } catch (err) {
    console.error('Failed to parse Phone Number', phoneNumber);
  } finally {
    return cPhoneNumber ?? '';
  }
}

function buildHubspotSearchBodyRequest(typeSearch, value, correct) {
  const newValue = value.replace(/[A-Za-z\:\+]/g, '');
  const withNine = `${newValue.substring(0, 4)}9${newValue.substring(4)}`;
  let withoutNine = newValue.split('');
  withoutNine.splice(4, 1);
  withoutNine = withoutNine.join('');

  const filters = typeSearch.includes('phone')
    ? [
        {
          value: correct ? correctPhoneNumber(withoutNine) : withoutNine,
          propertyName: 'phone',
          operator: 'CONTAINS_TOKEN',
        },
        {
          value: correct ? correctPhoneNumber(withNine) : withNine,
          propertyName: 'mobilephone',
          operator: 'CONTAINS_TOKEN',
        },
        {
          value: correct ? correctPhoneNumber(withNine) : withNine,
          propertyName: 'phone',
          operator: 'CONTAINS_TOKEN',
        },
        {
          value: correct ? correctPhoneNumber(newValue) : newValue,
          propertyName: 'mobilephone',
          operator: 'CONTAINS_TOKEN',
        },
        {
          value: correct ? correctPhoneNumber(newValue) : newValue,
          propertyName: 'phone',
          operator: 'CONTAINS_TOKEN',
        },
      ]
    : [
        {
          value,
          propertyName: typeSearch || 'email',
          operator: 'EQ',
        },
      ];

  return {
    filterGroups: filters.map((filter) => {
      if (filter.value && filter.value !== '') {
        return {
          filters: [
            {
              value: filter.value,
              propertyName: filter.propertyName,
              operator: filter.operator,
            },
          ],
        };
      }
      return null;
    }),
    properties: [
      'guardiao',
      'email',
      'firstname',
      'hs_object_id',
      'lastname',
      'phone',
      'mobilephone',
      'company',
      'classificacao_do_cliente',
      'atendimento_ativo_por',
      'ultima_mensagem_disparada',
      'idioma_fluxo',
      'guardiao__cs_',
      'associatedcompanyid',
      'num_associated_deals',
      'govc_i_filas_twillio_contact',
      'squad_cs',
    ],
  };
}

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();

  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const hubspotAxiosInstance = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
      Authorization: `Bearer ${context.HUBSPOT_API_KEY}`,
    },
  });

  let { clientEmail: value } = event;
  const { typeSearch } = event;
  const regexNumber = /[0-9]/g;

  value = value.replace(/\s/g, '');

  if (!value) {
    response.setBody({
      success: false,
      message: `Client ${typeSearch || 'email'} is undefined`,
    });
    logger.error('Cannot search client (typeSearch not specified)', { value, typeSearch });
    return callback('typeSearch not specified', response);
  }

  if (typeSearch.includes('phone') && !regexNumber.test(value.replace(/[A-Za-z\:\+]/g, ''))) {
    response.setBody({ success: false, message: 'Value type is invalid' });
    logger.error('Cannot search client (value not specified)', { value, typeSearch });
    return callback('value not specified', response);
  }

  try {
    // FIRST TRY (CORRECTING VALUES)
    let bodyRequest = buildHubspotSearchBodyRequest(typeSearch, value, true);
    logger.debug('Search Client Hubspot Body Request', bodyRequest);
    let { data: contacts } = await hubspotAxiosInstance.post(`${OBJECTS_URL}/contacts/search`, bodyRequest);

    if (contacts.results.length > 0) {
      let workerSid;
      let guardian;
      let guardianSkill;

      if (contacts.results[0].properties.guardiao__cs_) {
        try {
          const { data: owner } = await hubspotAxiosInstance.get(
            `/crm/v3/owners/${contacts.results[0].properties.guardiao__cs_}`,
            {
              params: {
                properties: 'hubspot_owner_id,email,lastname,firstname',
                archived: 'false',
              },
            },
          );
          guardian = owner.email;
        } catch (err) {
          logger.error('Could not Search Client - Owner not found', { event, err });
          guardian = undefined;
        }

        if (guardian) {
          logger.log('guardian found', { guardian, event });
          try {
            const workers = await client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).workers.list({
              targetWorkersExpression: `email == "${guardian}"`,
            });

            // eslint-disable-next-line max-depth
            if (workers?.length > 0) {
              const workerAttributes = JSON.parse(workers[0].attributes);
              // eslint-disable-next-line max-depth
              if (workerAttributes?.routing?.skills?.length > 0) {
                guardianSkill = workerAttributes?.routing?.skills[0];
              } else {
                logger.warn('no guardian skill was found', workerAttributes, event);
              }

              workerSid = workers[0].sid;
              logger.debug('guardian worker was found', workerSid);
            } else {
              logger.warn('guardian is probably not a Flex user', { guardian, event });
            }
          } catch (err) {
            logger.error('Error finding guardian', { guardian, event, err });
          }
        }
      } else {
        logger.warn('No guardian for this contact', { contacts, event });
      }

      const responseData = {
        ...contacts.results[0],
        properties: {
          ...contacts.results[0].properties,
          guardian,
          guardianSkill,
          workerSid,
        },
      };
      logger.info('Successfully retrieved client from Hubspot', { responseData, event });
      response.setBody({
        success: true,
        data: responseData,
      });

      return callback(null, response);
    }

    // SECOND TRY (NOT CORRECTING VALUES)
    bodyRequest = buildHubspotSearchBodyRequest(typeSearch, value, false);
    logger.debug('Search Client Hubspot Body Request', bodyRequest);
    console.log('Second bodyRequest', bodyRequest);
    const secondResult = await hubspotAxiosInstance.post(`${OBJECTS_URL}/contacts/search`, bodyRequest);
    contacts = secondResult?.data;
    console.log('Second Contacts', contacts);

    if (contacts && contacts.results && contacts.results.length > 0) {
      let workerSid;
      let guardian;
      let guardianSkill;

      if (contacts.results[0].properties.guardiao__cs_) {
        try {
          const { data: owner } = await hubspotAxiosInstance.get(
            `/crm/v3/owners/${contacts.results[0].properties.guardiao__cs_}`,
            {
              params: {
                properties: 'hubspot_owner_id,email,lastname,firstname',
                archived: 'false',
              },
            },
          );
          guardian = owner.email;
        } catch (err) {
          logger.error('Could not Search Client - Owner not found', { event, err });
          guardian = undefined;
        }

        if (guardian) {
          logger.log('guardian found', { guardian, event });
          try {
            const workers = await client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).workers.list({
              targetWorkersExpression: `email == "${guardian}"`,
            });

            // eslint-disable-next-line max-depth
            if (workers?.length > 0) {
              const workerAttributes = JSON.parse(workers[0].attributes);
              // eslint-disable-next-line max-depth
              if (workerAttributes?.routing?.skills?.length > 0) {
                guardianSkill = workerAttributes?.routing?.skills[0];
              } else {
                logger.warn('no guardian skill was found', workerAttributes, event);
              }

              workerSid = workers[0].sid;
              logger.debug('guardian worker was found', workerSid);
            } else {
              logger.warn('guardian is probably not a Flex user', { guardian, event });
            }
          } catch (err) {
            logger.error('Error finding guardian', { guardian, event, err });
          }
        }
      } else {
        logger.warn('No guardian for this contact', { contacts, event });
      }

      const responseData = {
        ...contacts.results[0],
        properties: {
          ...contacts.results[0].properties,
          guardian,
          guardianSkill,
          workerSid,
        },
      };
      logger.info('Successfully retrieved client from Hubspot', { responseData, event });
      response.setBody({
        success: true,
        data: responseData,
      });

      return callback(null, response);
    }

    // IF NOTHING FOUND
    logger.warn('Client not found', { bodyRequest, event });
    response.setBody({
      success: false,
      message: 'Client not found',
      data: {
        properties: {
          idioma_fluxo: 'unset',
        },
      },
    });
    return callback(null, response);
  } catch (error) {
    logger.error('Could not search client', { event, error });
    response.setBody({ success: false, error });
    return callback(error, response);
  }
};
