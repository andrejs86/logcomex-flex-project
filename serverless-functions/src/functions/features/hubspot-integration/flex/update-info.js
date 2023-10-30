const axios = require('axios');

const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

const OBJECTS_URL = `/crm/v3/objects`;

async function searchContact(value, hubspotAxiosInstance) {
  try {
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
    if (contacts.results.length > 0) {
      logger.debug('Contact found', { hs_object_id: contacts.results[0].properties.hs_object_id });
      return contacts.results[0].properties.hs_object_id;
    }

    logger.warn('Contact not found!', { filters, bodyRequest });
    return false;
  } catch (err) {
    logger.error('Could not search contact', { value, err });
    return false;
  }
}

async function editContactInfo(hubspot_id, number, hubspotAxiosInstance) {
  const formatedNumber = number.replace('whatsapp:+', '');
  try {
    await hubspotAxiosInstance.patch(`${OBJECTS_URL}/contacts/${hubspot_id}`, {
      properties: {
        phone: formatedNumber,
      },
    });
    logger.debug('Contact Info Updated on Hubspot', { hubspot_id, number });
    return true;
  } catch (error) {
    logger.error('Could not update contact on Hubspot', { hubspot_id, number, error });
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
    logger.debug('Sent message property updated on Hubspot', { hubspot_id, properties });
    return true;
  } catch (error) {
    logger.error('Sent message property NOT updated on Hubspot', { hubspot_id, newValue, message, error });
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
      Authorization: `Bearer ${context.HUBSPOT_API_KEY}`,
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
    logger.error('No information provided to update info on Hubspot', { event });
    return callback(null, response);
  }

  try {
    const updateResponse = messagePropertyValue
      ? await editSentMessageProperty(hubspot_id, newNumber, event.message, hubspotAxiosInstance)
      : await editContactInfo(hubspot_id, newNumber, hubspotAxiosInstance);

    if (updateResponse) {
      logger.debug('Phone number updated', { hubspot_id, newNumber, event });
      response.setBody({
        success: true,
        message: 'PhoneNumber Updated',
      });
    } else {
      logger.error('Could not update Phone Number on Hubspot', { hubspot_id, newNumber, event });
      response.setBody({
        success: false,
        message: 'PhoneNumber Not Updated',
      });
    }

    return callback(null, response);
  } catch (err) {
    logger.error('Could not update info', { event, err });
    response.setBody({
      success: false,
      message: `Error ${err}`,
    });

    return callback(err, response);
  }
};
