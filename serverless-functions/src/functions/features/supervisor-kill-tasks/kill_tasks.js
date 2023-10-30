const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const { task_sid, conversation_sid } = event;

  try {
    const task = await client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).tasks(task_sid).fetch();

    const killResult = await client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).tasks(task.sid).update({
      assignmentStatus: 'completed',
      reason: 'task killed',
    });
    logger.debug('Task Successfully Killed', { killResult, task_sid, conversation_sid });

    const killConvoResult = await client.conversations.v1.conversations(conversation_sid).update({ state: 'closed' });
    logger.debug('Conversation Successfully Killed', { killConvoResult, task_sid, conversation_sid });

    const twilioResponse = new Twilio.Response();
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    twilioResponse.setHeaders(headers);
    twilioResponse.setBody({ success: true });
    return callback(null, twilioResponse);
  } catch (err) {
    logger.error('could not kill task', { err, task_sid, conversation_sid });
    return callback(err, null);
  }
};
