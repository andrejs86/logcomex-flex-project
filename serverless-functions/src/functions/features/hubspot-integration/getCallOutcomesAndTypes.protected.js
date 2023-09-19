const axios = require('axios');

async function getTypes(hubspotAxiosInstance) {
  const { data } = await hubspotAxiosInstance.get(`/crm/v3/properties/call/hs_activity_type`);

  return data.options;
}

async function getOutcomes(hubspotAxiosInstance) {
  const outcomes = await hubspotAxiosInstance.get(`/calling/v1/dispositions`);

  return outcomes.data;
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

  try {
    const types = await getTypes(hubspotAxiosInstance);
    const outcomes = await getOutcomes(hubspotAxiosInstance);

    response.setBody({
      success: true,
      outcomes,
      types,
    });

    return callback(null, response);
  } catch (e) {
    console.log(e);
    response.setBody({
      success: false,
      types: [],
      outcomes: [],
    });

    return callback(null, response);
  }
};
