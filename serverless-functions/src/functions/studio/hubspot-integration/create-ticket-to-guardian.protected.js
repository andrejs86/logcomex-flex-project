const axios = require('axios');

const OBJECTS_URL = `/crm/v3/objects`;
const ASSOCIATIONS_URL = `/crm/v3/associations`;

async function createTicket(hubspotAxiosInstance, properties) {
  try {
    const ticketObject = await hubspotAxiosInstance.post(`${OBJECTS_URL}/tickets`, {
      properties: {
        hs_pipeline: 0,
        hs_pipeline_stage: 1,
        subject: `Contato iniciado fora de horário no fluxo de voz Twilio - ${properties.customer_name}`,
        hubspot_owner_id: properties.hubspot_owner_id,
      },
    });

    return ticketObject.data.id;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function createRelation(hubspotId, ticketId, hubspotAxiosInstance) {
  if (hubspotId && ticketId) {
    await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/contact/ticket/batch/create`, {
      inputs: [
        {
          from: { id: hubspotId },
          to: { id: ticketId },
          type: 'contact_to_ticket',
        },
      ],
    });
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
      Authorization: `Bearer ${context.PRIVATE_APP_TOKEN}`,
    },
  });

  const hubspotId = Number(event.hs_object_id) || null;

  const properties = {
    hubspot_owner_id: Number(event.hubspot_owner_id),
    customer_name: event.customer_name,
  };

  const ticketId = await createTicket(hubspotAxiosInstance, properties);
  await createRelation(hubspotId, ticketId, hubspotAxiosInstance);

  if (!ticketId) {
    response.setBody({ success: false, message: 'Fail to Create Ticket' });
    return callback(null, response);
  }

  response.setBody({
    success: true,
    ticketId,
  });

  return callback(null, response);
};
