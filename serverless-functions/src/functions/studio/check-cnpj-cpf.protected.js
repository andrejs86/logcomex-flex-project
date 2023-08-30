exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const { clientDocument } = event;
  const regexCnpjCpf = /\b(\d{3}\.?\d{3}\.?\d{3}\-?\d{2}|\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2})\b/gm;

  if (!clientDocument) {
    response.setBody({
      success: false,
      message: 'Client document is undefined',
    });
    return callback(null, response);
  }

  const documentCleaned = clientDocument.replace(/[^\w]/gi, '').replace(/[a-z]/gi, '');

  if (regexCnpjCpf.test(documentCleaned)) {
    response.setBody({
      success: true,
      message: 'Success!',
    });

    return callback(null, response);
  }

  response.setBody({
    success: false,
    message: 'Client document is invalid',
  });
  return callback(null, response);
};
