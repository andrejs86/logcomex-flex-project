exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const client = context.getTwilioClient();
  const { clientNumber, templateContent, twilioNumber } = event;

  if (!clientNumber) {
    response.setBody({
      success: false,
      message: 'Client number is undefined',
    });

    return callback(null, response);
  }

  if (!templateContent) {
    response.setBody({
      success: false,
      message: 'Template content is undefined',
    });

    return callback(null, response);
  }

  try {
    const fromNumberFormatted = twilioNumber.replace(/\D/gi, '');
    const toNumberFormatted = clientNumber.replace(/\D/gi, '');

    const data = await client.messages.create({
      to: `whatsapp:+${toNumberFormatted}`,
      from: `whatsapp:+${fromNumberFormatted}`,
      body: templateContent,
    });

    response.setBody({
      success: true,
      data,
    });

    return callback(null, response);
  } catch (err) {
    response.setBody({
      success: false,
      message: err.message,
    });
    return callback(null, response);
  }
};
