const awsomePhone = require('awesome-phonenumber');

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  // Retornar 'AR', 'BR' ou 'US' e usar esse retorno para definir o caminho no fluxo
  const { clientNumber, idioma } = event;

  if (idioma && idioma !== 'unset') {
    response.setBody({
      regionCode: `${idioma}`,
    });

    return callback(null, response);
  }

  let parsedNumber;
  const hasWppWord = clientNumber.includes('whatsapp');

  if (hasWppWord) parsedNumber = clientNumber.replace('whatsapp:', '');

  const phoneNumber = awsomePhone.parsePhoneNumber(hasWppWord ? parsedNumber : clientNumber);
  const regionCode = phoneNumber.getRegionCode();

  response.setBody({
    regionCode: `${regionCode}`,
  });

  return callback(null, response);
};
