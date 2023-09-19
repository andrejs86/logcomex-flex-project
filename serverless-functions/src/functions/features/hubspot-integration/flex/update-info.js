const axios = require('axios');

const OBJECTS_URL = `/crm/v3/objects`;

async function searchContact(value, hubspotAxiosInstance) {
  const newValue = value.replace(/[A-Za-z\:\+]/g, '');
  const withNine = `${newValue.substring(0, 4)}9${newValue.substring(4)}`;
  let withoutNine = newValue.split('');
  withoutNine.splice(4, 1);
  withoutNine = withoutNine.join('');

  const filters = [
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
    properties: ['hs_object_id'],
  };

  const { data: contacts } = await hubspotAxiosInstance.post(`${OBJECTS_URL}/contacts/search`, bodyRequest);
  if (contacts.results.length > 0) return contacts.results[0].properties.hs_object_id;

  return false;
}

async function editContactInfo(hubspot_id, number, hubspotAxiosInstance) {
  const formatedNumber = number.replace('whatsapp:+', '');
  try {
    await hubspotAxiosInstance.patch(`${OBJECTS_URL}/contacts/${hubspot_id}`, {
      properties: {
        phone: formatedNumber,
      },
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function editSentMessageProperty(hubspot_id, newValue, message, hubspotAxiosInstance) {
  const finalValue = newValue === 'clear' ? '' : newValue;

  const properties = {
    atendimento_ativo_por: finalValue,
  };

  if (message) properties.ultima_mensagem_disparada = message;

  try {
    await hubspotAxiosInstance.patch(`${OBJECTS_URL}/contacts/${hubspot_id}`, {
      properties,
    });
    return true;
  } catch (error) {
    return false;
  }
}

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const hubspotAxiosInstance = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
      Authorization: `Bearer ${event.HubspotApiToken}`,
    },
  });

  let { hubspot_id } = event;
  const { newNumber, messagePropertyValue, search } = event;

  if (!hubspot_id && search) hubspot_id = await searchContact(search, hubspotAxiosInstance);

  if (!hubspot_id || (!newNumber && !messagePropertyValue)) {
    response.setBody({
      success: false,
      message: 'No information provided',
    });
    return callback(null, response);
  }

  try {
    const updateResponse = messagePropertyValue
      ? await editSentMessageProperty(hubspot_id, newNumber, event.message, hubspotAxiosInstance)
      : await editContactInfo(hubspot_id, newNumber, hubspotAxiosInstance);

    if (updateResponse) {
      response.setBody({
        success: true,
        message: 'PhoneNumber Updated',
      });
    } else {
      response.setBody({
        success: false,
        message: 'PhoneNumber Not Updated',
      });
    }

    return callback(null, response);
  } catch (err) {
    response.setBody({
      success: false,
      message: `Error ${err}`,
    });

    return callback(null, response);
  }
};
