const axios = require('axios');

const OBJECTS_URL = `/crm/v3/objects`;

async function editContactInfo(hubspot_id, language, hubspotAxiosInstance) {
  try {
    await hubspotAxiosInstance.patch(`${OBJECTS_URL}/contacts/${hubspot_id}`, {
      properties: {
        idioma_fluxo: language,
      },
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
      Authorization: `Bearer ${context.HUBSPOT_API_KEY}`,
    },
  });

  const { hubspot_id, language } = event;

  if (!hubspot_id || hubspot_id === 'unset' || !language) {
    response.setBody({
      success: false,
      message: 'No information provided',
    });
    return callback(null, response);
  }

  try {
    const updateResponse = await editContactInfo(hubspot_id, language, hubspotAxiosInstance);

    if (updateResponse) {
      response.setBody({
        success: true,
        message: 'Language Updated',
      });
    } else {
      response.setBody({
        success: false,
        message: 'Language Not Updated',
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
