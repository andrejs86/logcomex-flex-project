exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const client = context.getTwilioClient();

  try {
    const { data } = await client.sync.v1
      .services(context.TWILIO_FLEX_SYNC_SID)
      .documents(event.TypesAndOutcomesDocumentSid)
      .fetch();

    response.setBody({ success: true, outcomes: data.outcomes, types: data.types });

    return callback(null, response);
  } catch (e) {
    console.log(e);
    response.setBody({
      success: false,
      types: [],
      outcomes: [],
    });

    return callback(null, response);
  }
};
