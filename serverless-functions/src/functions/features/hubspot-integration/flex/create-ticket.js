const axios = require('axios');

const OBJECTS_URL = `/crm/v3/objects`;
const ASSOCIATIONS_URL = `/crm/v3/associations`;

async function createTicket(taskAttributes, hubspotAxiosInstance) {
  try {
    const ticketObject = await hubspotAxiosInstance.post(`${OBJECTS_URL}/tickets`, {
      properties: {
        hs_pipeline: 0,
        hs_pipeline_stage: 1,
        subject: taskAttributes.name,
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
      Authorization: `Bearer ${context.HUBSPOT_API_TOKEN}`,
    },
  });

  const taskAttributes = JSON.parse(event.taskAttributes);
  if (!taskAttributes) {
    response.setBody({ success: false, message: 'No attribues provided' });
    return callback(null, response);
  }

  const isSupport = taskAttributes?.subject === 'send-to-Suporte_SMB_1_Analytics';
  if (!isSupport) {
    response.setBody({ success: false, message: 'NoSupport' });
    return callback(null, response);
  }

  const defaultTicketUrl = context.DEFAULT_TICKET_URL;
  const hubspotId = Number(taskAttributes.clientInformation.hs_object_id) || null;

  const ticketId = await createTicket(taskAttributes, hubspotAxiosInstance);
  console.log('Ticket created', ticketId);
  await createRelation(hubspotId, ticketId, hubspotAxiosInstance);
  console.log('Relation created');

  if (!ticketId) {
    response.setBody({ success: false, message: 'Failed to Create Ticket' });
    return callback(null, response);
  }

  response.setBody({
    success: true,
    ticketId,
    ticketUrl: defaultTicketUrl + ticketId,
  });

  return callback(null, response);
};
