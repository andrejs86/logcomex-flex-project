const axios = require('axios');

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const tokenAuthorization = `${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`;
  const buffer = Buffer.from(tokenAuthorization);

  const tokenFormatted = buffer.toString('base64');

  const { data } = await axios
    .get('https://messaging.twilio.com/v1/Channels/WhatsApp/Templates', {
      headers: { Authorization: `Basic ${tokenFormatted}` },
    })
    .catch((err) => {
      response.setBody({
        success: false,
        message: err.response.data.data.message,
      });
      callback(err, response);
    });

  const templatesFiltered = [];

  if (data.whatsapp_templates) {
    data.whatsapp_templates.map((template) => {
      return template.languages.map((language) => {
        if (language.status !== 'approved') {
          return null;
        }

        templatesFiltered.push({
          name: template.template_name,
          content: language.content,
          language: language.language,
          sid: template.sid,
        });
        return null;
      });
    });
  }

  response.setBody({
    success: true,
    templatesFiltered,
  });

  callback(null, response);
};
