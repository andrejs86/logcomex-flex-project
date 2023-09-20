const awesomePhone = require('awesome-phonenumber');

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  // Retornar 'AR', 'BR' ou 'US' e usar esse retorno para definir o caminho no fluxo
  const { clientNumber, idioma } = event;

  try {
    if (idioma && idioma !== 'unset') {
      response.setBody({
        regionCode: `${idioma}`,
      });

      return callback(null, response);
    }

    let parsedNumber;
    const hasWppWord = clientNumber.includes('whatsapp');

    if (hasWppWord) parsedNumber = clientNumber.replace('whatsapp:', '');

    const phoneNumber = awesomePhone.parsePhoneNumber(hasWppWord ? parsedNumber : clientNumber);
    const regionCode = phoneNumber.regionCode;

    console.log('detected region code=', regionCode);

    response.setBody({
      regionCode: `${regionCode}`,
    });

    return callback(null, response);
  } catch (error) {
    console.error(error);
    response.setBody({
      regionCode: 'BR', // retorna BR como padrão
    });
    return callback(error, response);
  }
};
