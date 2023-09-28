exports.handler = async (context, event, callback) => {
  try {
    const client = context.getTwilioClient();
    const { task_sid, conversation_sid } = event;
    console.log('Trying to kill task -----> ', task_sid);

    const task = await client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).tasks(task_sid).fetch();

    const killResult = await client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).tasks(task.sid).update({
      assignmentStatus: 'completed',
      reason: 'task killed',
    });
    console.log('Task Successfully Killed -------> ', killResult.sid);

    console.log('Trying to kill Conversation -----> ', conversation_sid);
    const killConvoResult = await client.conversations.v1.conversations(conversation_sid).update({ state: 'closed' });
    console.log('Conversation Successfully Killed -------> ', killConvoResult.sid);

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
    console.error(err);
    return callback(err, null);
  }
};
