const TwilioHelper = require(Runtime.getFunctions()['features/post-task-survey/helpers/twilio-response']
  .path).TwilioHelper;
const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const responseHelper = new TwilioHelper();
  const { csatMeasure, clientNumber, conversationSid } = event;
  const { TWILIO_FLEX_WORKSPACE_SID, POST_TASK_SURVEY_QUEUE_SID } = context;

  try {
    if (conversationSid) {
      client.conversations.v1.conversations(conversationSid).update({ state: 'Closed' });
    } else {
      logger.warn('Conversation SID not provided!', { csatMeasure, clientNumber, conversationSid });
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

      logger.debug('task attributes updated', { task: tasks[0], csatMeasure, clientNumber, conversationSid });
    }

    if (tasks.length === 0) {
      logger.warn('task not found!', { csatMeasure, clientNumber, conversationSid });
    }

    const response = responseHelper.defaultResponse();
    logger.info('Survey successfully finalized', { task: tasks[0], csatMeasure, clientNumber, conversationSid });
    response.setBody({ message: 'Survey successfully finalized' });
    return callback(null, response);
  } catch (err) {
    logger.error('Could not close survey', { csatMeasure, clientNumber, conversationSid, err });
    const response = responseHelper.defaultResponse();
    response.setBody({ message: 'Failed to save CSAT results to task attribute' });
    return callback(response);
  }
};
