exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const client = context.getTwilioClient();
  const { clientNumber, templateContent } = event;

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
    const twilioNumber = context.TWILIO_WHATSAPP_NUMBER;
    const phoneRegex = /^(55)?\(?[1-9]{2}\)?\s?\d{4,5}(\-|\s)?\d{4}$/gm;

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
