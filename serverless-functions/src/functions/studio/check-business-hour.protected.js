function fixGMT(timezone, date = new Date()) {
  const aux = new Date(date.valueOf());
  aux.setHours(aux.getHours() + timezone);
  return aux;
}

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const nowDate = fixGMT(-3);

  if (nowDate.getDay() >= 1 && nowDate.getDay() <= 5 && nowDate.getHours() >= 8 && nowDate.getHours() < 18) {
    response.setBody({ success: true });
    return callback(null, response);
  }

  response.setBody({ success: false });
  return callback(null, response);
};
