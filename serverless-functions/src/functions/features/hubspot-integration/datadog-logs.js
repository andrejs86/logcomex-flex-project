const axios = require('axios');

exports.handler = async (context, event, callback) => {
  console.log(' ----- Datadog Logs -----');
  if (JSON.stringify(event) === '{}') {
    throw new Exception('Blank Event Datadog Logs');
  }

  const ddtags = event.ddtags;
  const message = event.message;
  const level = event.level;
  const data = event.data && JSON.parse(event.data);

  const headers = {
    accept: 'application/json',
    'Content-Type': 'application/json',
    'DD-API-KEY': context.DD_API_KEY_DATADOG,
  };

  const instance = axios.create({
    baseURL: context.BASE_URL_DATADOG_LOGS,
    headers,
  });

  const body = {
    ddtags,
    message,
    level,
    ddsource: 'Twilio',
    service: 'twilio-plugin',
  };

  if (event.data) {
    body.data = data;
  }

  await instance
    .post('/logs/', body)
    .then((response) => {
      console.log('------ POST Datadog Logs -------');
      console.log(response.config.data);

      return callback(null, { response: response.config.data });
    })
    .catch((error) => {
      console.log('------ ERROR POST Datadog Logs -------');

      return callback({
        errorMessage: error.message,
      });
    });
};
