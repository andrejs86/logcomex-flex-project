const axios = require('axios');

const OBJECTS_URL = `/crm/v3/objects`;

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const { company_id } = event;

  const hubspotAxiosInstance = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
      Authorization: `Bearer ${context.HUBSPOT_API_KEY}`,
    },
  });

  try {
    let farmerEmail;
    let company;

    if (!company_id) {
      response.setBody({
        success: false,
        error: 'Without Company ID',
      });

      return callback(null, response);
    }

    if (company_id) {
      const { data } = await hubspotAxiosInstance.get(`${OBJECTS_URL}/companies/${company_id}`, {
        params: {
          properties: 'farmer, status',
          archived: 'false',
        },
      });

      company = data;

      if (data.properties.farmer) {
        const { data: farmer } = await hubspotAxiosInstance.get(`/crm/v3/owners/${data.properties.farmer}`, {
          params: {
            properties: 'hubspot_owner_id, email,lastname,firstname',
            archived: 'false',
          },
        });

        farmerEmail = farmer.email;
      }
    }

    response.setBody({
      success: true,
      farmerEmail: farmerEmail ?? 'isabela.lopes@logcomex.com',
      company,
    });

    return callback(null, response);
  } catch (error) {
    console.log(error);
    response.setBody({ success: false, error: error.message });
    return callback(response, null);
  }
};
