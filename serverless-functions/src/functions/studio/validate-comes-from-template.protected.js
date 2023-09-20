const axios = require('axios');

const OBJECTS_URL = `/crm/v3/objects`;

async function getMessageStatus(hubspotId, hubspotAxiosInstance) {
  const response = await hubspotAxiosInstance
    .get(`${OBJECTS_URL}/contacts/${hubspotId}?propertiesWithHistory=ultima_mensagem_disparada`)
    .then((_response) => _response)
    .catch((_err) => null);

  if (!response) return false;
  if (response.data.propertiesWithHistory.ultima_mensagem_disparada.length < 1) return false;

  const now = new Date();
  const sentDate = new Date(response.data.propertiesWithHistory.ultima_mensagem_disparada[0].timestamp);

  if (response.data.propertiesWithHistory.ultima_mensagem_disparada[0].value === '') return false;

  const differenceDays = Math.floor((now - sentDate) / (1000 * 3600 * 24));

  return {
    diferenceDays: differenceDays <= 3,
    messageSend: response.data.propertiesWithHistory.ultima_mensagem_disparada[0].value,
  };
}

async function getWorkerStatus(email, client) {
  const workers = await client.taskrouter.v1
    .workspaces(process.env.TWILIO_FLEX_WORKSPACE_SID)
    .workers.list({
      targetWorkersExpression: `email == '${email}'`,
    })
    .then((_workers) => _workers)
    .catch((_err) => null);

  if (!workers)
    return {
      available: false,
      status: 'Worker não encontrado',
    };
  if (workers.length < 1)
    return {
      available: false,
      status: 'Worker não encontrado',
    };

  return {
    available: workers[0].available === true,
    workerSkill: JSON.parse(workers[0].attributes)?.routing?.skills[0],
    status: workers[0].activityName,
  };
}

async function clearProperty(hubspot_id, hubspotAxiosInstance) {
  const properties = {
    atendimento_ativo_por: '',
    ultima_mensagem_disparada: '',
  };

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
      Authorization: `Bearer ${context.HUBSPOT_API_KEY}`,
    },
  });

  try {
    const client = context.getTwilioClient();
    const { workerEmail, hubspotId, conversationSid } = event;

    if (!hubspotId || !workerEmail) {
      response.setBody({
        success: false,
        message: 'No info provided',
        to: 'flow',
      });
      return callback(null, response);
    }

    const { diferenceDays, messageSend } = await getMessageStatus(hubspotId, hubspotAxiosInstance);
    const workerStatus = await getWorkerStatus(workerEmail, client);

    let to = 'flow';
    let message = 'No message';

    if (workerStatus.available && diferenceDays) {
      to = 'worker';
      message = 'Transfer to worker';
    } else if (!workerStatus.available && diferenceDays) {
      to = 'queue';
      flow = false;
      message = `Transfer to queue. Worker Status: ${workerStatus.status}`;
    }

    await clearProperty(hubspotId, hubspotAxiosInstance);

    const participants = await client.conversations.v1.conversations(conversationSid).participants.list();

    await client.conversations.v1.conversations(conversationSid).messages.create({
      author: participants[0].messagingBinding.address,
      body: `**Mensagem do template:** \n ${messageSend}`,
    });

    response.setBody({ success: true, message, to, workerSkill: workerStatus.workerSkill });
    return callback(null, response);
  } catch (err) {
    console.log(err);
    response.setBody({ success: false, message: err.message, to: 'flow' });
    return callback(null, response);
  }
};
