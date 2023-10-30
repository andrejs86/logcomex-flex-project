const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

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
  logger.debug('Cancel-or-Complete', { event });
  try {
    const task = await client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).tasks(taskSid).fetch();

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

    await client.taskrouter.v1
      .workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
      .tasks(taskSid)
      .update({ assignmentStatus: status, reason: 'task transferred' });

    logger.debug('Successfully updated task', { status, task, event });

    response.setBody({
      success: true,
      message: `Tarefa ${taskSid} finalizada`,
    });

    return callback(null, response);
  } catch (error) {
    logger.error('Could not cancel or complete task.', { error, event });
    response.setBody({
      success: false,
      message: error.message,
    });

    return callback(null, response);
  }
};
