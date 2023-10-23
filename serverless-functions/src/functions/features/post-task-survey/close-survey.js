const TwilioHelper = require(Runtime.getFunctions()['features/post-task-survey/helpers/twilio-response']
  .path).TwilioHelper;

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const responseHelper = new TwilioHelper();
  const { csatMeasure, clientNumber, conversationSid } = event;
  const { TWILIO_FLEX_WORKSPACE_SID, POST_TASK_SURVEY_QUEUE_SID } = context;

  try {
    if (conversationSid) {
      client.conversations.v1.conversations(conversationSid).update({ state: 'Closed' });
    } else {
      console.log('Conversation SID not provided!');
    }

    const tasks = await client.taskrouter.v1.workspaces(TWILIO_FLEX_WORKSPACE_SID).tasks.list({
      taskQueueSid: POST_TASK_SURVEY_QUEUE_SID,
      evaluateTaskAttributes: `customerAddress == "${clientNumber}" OR customerName == "${clientNumber}" OR conversationSid == "${conversationSid}"`,
    });

    if (tasks.length > 1) {
      console.log('got more than 1 task');
      tasks.forEach((t) => console.log(t.sid, t.age));
      tasks.sort((a, b) => a.age - b.age);
    }

    if (tasks.length > 0) {
      console.log('selected task', tasks[0].sid);
      const originalAttributes = JSON.parse(tasks[0].attributes);

      if (!originalAttributes.conversations) {
        originalAttributes.conversations = {};
      }

      originalAttributes.conversations.conversation_measure_1 = Number(csatMeasure);
      originalAttributes.conversations.kind = 'Survey';
      originalAttributes.conversations.case = 'Finalizou CSAT';

      await client.taskrouter.v1
        .workspaces(TWILIO_FLEX_WORKSPACE_SID)
        .tasks(tasks[0].sid)
        .update({
          attributes: JSON.stringify(originalAttributes),
        })
        .then(() => {
          return client.taskrouter.v1.workspaces(TWILIO_FLEX_WORKSPACE_SID).tasks(tasks[0].sid).update({
            assignmentStatus: 'canceled',
            reason: 'CSAT saved',
          });
        });

      console.log('task attributes updated');
    }

    if (tasks.length === 0) {
      console.log('task not found!');
    }

    const response = responseHelper.defaultResponse();
    response.setBody({ message: 'Survey successfully finalized' });
    return callback(null, response);
  } catch (err) {
    console.log(err);
    const response = responseHelper.defaultResponse();
    response.setBody({ message: 'Failed to save CSAT results to task attribute' });
    return callback(response);
  }
};
