const axios = require('axios');

const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

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

    logger.info('Ticket created on Hubspot', taskAttributes, ticketObject);

    return ticketObject.data.id;
  } catch (err) {
    logger.error('Could not create ticket on Hubspot', taskAttributes, err);
    return false;
  }
}

async function createRelation(hubspotId, ticketId, hubspotAxiosInstance) {
  if (hubspotId && ticketId) {
    try {
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/contact/ticket/batch/create`, {
        inputs: [
          {
            from: { id: hubspotId },
            to: { id: ticketId },
            type: 'contact_to_ticket',
          },
        ],
      });
    } catch (err) {
      logger.error('Could not create relation contact_to_ticket', hubspotId, ticketId, err);
    }
  } else {
    logger.error('Could not create relation contact_to_ticket (no info provided)', hubspotId, ticketId);
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

  const taskAttributes = JSON.parse(event.taskAttributes);
  if (!taskAttributes) {
    logger.error('Could not create ticket (no taskAttributes provided)', event);
    response.setBody({ success: false, message: 'No attribues provided' });
    return callback(null, response);
  }

  const isSupport = taskAttributes?.subject === 'send-to-Suporte_SMB_1_Analytics';
  if (!isSupport) {
    logger.debug('No ticket will be created (not a support interaction)', event);
    response.setBody({ success: false, message: 'NoSupport' });
    return callback(null, response);
  }

  const defaultTicketUrl = context.DEFAULT_TICKET_URL;
  const hubspotId = Number(taskAttributes.clientInformation.hs_object_id) || null;

  const ticketId = await createTicket(taskAttributes, hubspotAxiosInstance);
  logger.debug('Ticket created', event, ticketId);
  await createRelation(hubspotId, ticketId, hubspotAxiosInstance);
  logger.debug('Relation created', event, hubspotId, ticketId);

  if (!ticketId) {
    logger.error('Ticket was not created. Check previous messages', hubspotId, ticketId, event);
    response.setBody({ success: false, message: 'Failed to Create Ticket' });
    return callback(null, response);
  }

  logger.info('Hubspot Ticket successfully created', event, hubspotId, ticketId, defaultTicketUrl + ticketId);
  response.setBody({
    success: true,
    ticketId,
    ticketUrl: defaultTicketUrl + ticketId,
  });

  return callback(null, response);
};
