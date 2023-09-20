const axios = require('axios');

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
    console.error('typeSearch not specified');
    return callback('typeSearch not specified', response);
  }

  if (typeSearch.includes('phone') && !regexNumber.test(value.replace(/[A-Za-z\:\+]/g, ''))) {
    response.setBody({ success: false, message: 'Value type is invalid' });
    console.error('value not specified');
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
    console.log('contacts found', contacts);

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
          console.log('Probably couldnt find guardian...');
          console.log(err);
          guardian = undefined;
        }

        if (guardian) {
          console.log('guardian found', guardian);
          const workers = await client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).workers.list({
            targetWorkersExpression: `email == "${guardian}"`,
          });

          if (workers?.length > 0) {
            const workerAttributes = JSON.parse(workers[0].attributes);
            // eslint-disable-next-line max-depth
            if (workerAttributes?.routing?.skills?.length > 0) {
              guardianSkill = workerAttributes?.routing?.skills[0];
            } else {
              console.log('no guardian skill was found');
            }

            workerSid = workers[0].sid;
            console.log('guardian worker was found', workerSid);
          } else {
            console.log('guardian is probably not a Flex user');
          }
        }
      } else {
        console.log('no guardian for this contact');
      }

      response.setBody({
        success: true,
        data: {
          ...contacts.results[0],
          properties: {
            ...contacts.results[0].properties,
            guardian,
            guardianSkill,
            workerSid,
          },
        },
      });

      return callback(null, response);
    }

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
    console.log(error);
    response.setBody({ success: false, error });
    return callback(error, response);
  }
};
