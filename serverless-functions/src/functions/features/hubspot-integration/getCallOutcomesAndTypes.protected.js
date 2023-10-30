const axios = require('axios');

const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

async function getTypes(hubspotAxiosInstance) {
  try {
    const { data } = await hubspotAxiosInstance.get(`/crm/v3/properties/call/hs_activity_type`);
    return data.options;
  } catch (err) {
    logger.error('Could not get Types', { err });
    return undefined;
  }
}

async function getOutcomes(hubspotAxiosInstance) {
  try {
    const outcomes = await hubspotAxiosInstance.get(`/calling/v1/dispositions`);
    return outcomes.data;
  } catch (err) {
    logger.error('Could not get outcomes', { err });
    return undefined;
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

  try {
    const types = await getTypes(hubspotAxiosInstance);
    const outcomes = await getOutcomes(hubspotAxiosInstance);

    if (types && outcomes) {
      response.setBody({
        success: true,
        outcomes,
        types,
      });
    } else {
      response.setBody({
        success: false,
        types: [],
        outcomes: [],
      });
    }

    return callback(null, response);
  } catch (e) {
    logger.error('Could not get Types and Outcomes', { event, e });
    response.setBody({
      success: false,
      types: [],
      outcomes: [],
    });

    return callback(null, response);
  }
};
