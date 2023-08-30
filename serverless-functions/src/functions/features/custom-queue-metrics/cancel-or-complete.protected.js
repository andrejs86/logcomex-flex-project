exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();

  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, User-Agent',
  );
  response.appendHeader('Vary', 'Origin');

  const { taskSid } = event;

  try {
    const task = await client.taskrouter.workspaces(context.TWILIO_WORKSPACE_SID).tasks(taskSid).fetch();

    let status;

    switch (task.assignmentStatus) {
      case 'assigned':
      case 'wrapping':
        status = 'completed';
        break;
      default:
        status = 'canceled';
        break;
    }

    await client.taskrouter
      .workspaces(context.TWILIO_WORKSPACE_SID)
      .tasks(taskSid)
      .update({ assignmentStatus: status, reason: 'task transferred' });

    response.setBody({
      success: true,
      message: `Tarefa ${taskSid} finalizada`,
    });

    return callback(null, response);
  } catch (error) {
    response.setBody({
      success: false,
      message: error.message,
    });

    return callback(null, response);
  }
};
