const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const client = context.getTwilioClient();
  const { clientNumber, templateContent } = event;

  console.log('Sending Whatsapp Message...', clientNumber, templateContent);

  if (!clientNumber) {
    response.setBody({
      success: false,
      message: 'Client number is undefined',
    });
    logger.error('Failed to send Whatsapp message. No client number was provided', event);
    return callback(null, response);
  }

  if (!templateContent) {
    response.setBody({
      success: false,
      message: 'Template content is undefined',
    });
    logger.error('Failed to send Whatsapp message. No template content was provided', event);
    return callback(null, response);
  }

  try {
    const twilioNumber = event.WhatsappNumber;
    const phoneRegex = /^(55)?\(?[1-9]{2}\)?\s?\d{4,5}(\-|\s)?\d{4}$/gm;

    const fromNumberFormatted = twilioNumber.replace(/\D/gi, '');
    const toNumberFormatted = clientNumber.replace(/\D/gi, '');

    const data = await client.messages.create({
      to: `whatsapp:+${toNumberFormatted}`,
      from: `whatsapp:+${fromNumberFormatted}`,
      body: templateContent,
    });

    logger.info('Successfully sent whatsapp message', data, event);
    response.setBody({
      success: true,
      data,
    });

    return callback(null, response);
  } catch (err) {
    logger.error('Could not send whatsapp message', event, err);
    response.setBody({
      success: false,
      message: err.message,
    });
    return callback(null, response);
  }
};
