const axios = require('axios');

const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

const OBJECTS_URL = `/crm/v3/objects`;

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
    const newValue = value.replace(/[A-Za-z\:\+]/g, '');
    const withNine = `${newValue.substring(0, 4)}9${newValue.substring(4)}`;
    let withoutNine = newValue.split('');
    withoutNine.splice(4, 1);
    withoutNine = withoutNine.join('');

    const filters = typeSearch.includes('phone')
      ? [
          {
            value: withoutNine,
            propertyName: 'phone',
            operator: 'CONTAINS_TOKEN',
          },
          {
            value: withNine,
            propertyName: 'mobilephone',
            operator: 'CONTAINS_TOKEN',
          },
          {
            value: withNine,
            propertyName: 'phone',
            operator: 'CONTAINS_TOKEN',
          },
          {
            value: newValue,
            propertyName: 'mobilephone',
            operator: 'CONTAINS_TOKEN',
          },
          {
            value: newValue,
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

    const bodyRequest = {
      filterGroups: filters.map((filter) => {
        return {
          filters: [
            {
              value: filter.value,
              propertyName: filter.propertyName,
              operator: filter.operator,
            },
          ],
        };
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
    const { data: contacts } = await hubspotAxiosInstance.post(`${OBJECTS_URL}/contacts/search`, bodyRequest);

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
                properties: 'hubspot_owner_id, email,lastname,firstname',
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
