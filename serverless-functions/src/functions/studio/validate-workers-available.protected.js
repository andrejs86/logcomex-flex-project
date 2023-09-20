async function getWorkerStatus(email, client) {
  const workers = await client.taskrouter
    .workspaces(process.env.TWILIO_FLEX_WORKSPACE_SID)
    .workers.list({
      targetWorkersExpression: `email == '${email}'`,
    })
    .then((_workers) => _workers)
    .catch((_err) => null);

  if (!workers)
    return {
      available: false,
      status: 'Worker não encontrado',
    };
  if (workers.length < 1)
    return {
      available: false,
      status: 'Worker não encontrado',
    };

  return {
    available: workers[0].available === true,
    status: workers[0].activityName,
  };
}

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  try {
    const client = context.getTwilioClient();
    const { workerEmail } = event;

    if (!workerEmail) {
      response.setBody({
        success: false,
        message: 'No info provided',
        to: 'flow',
      });
      return callback(null, response);
    }

    const workerStatus = await getWorkerStatus(workerEmail, client);

    let to = 'queue';
    let message = 'Transfer to queue';
    const status = workerStatus.status;

    if (workerStatus.available) {
      to = 'worker';
      message = 'Transfer to worker';
    }

    response.setBody({ success: true, message, to, status });
    return callback(null, response);
  } catch (err) {
    console.log(err);
    response.setBody({ success: false, message: err, to: 'queue' });
    return callback(null, response);
  }
};
