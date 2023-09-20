const TwilioHelper = require(Runtime.getFunctions()['features/post-task-survey/helpers/twilio-response']
  .path).TwilioHelper;
const { sendOutboundMessageAndWaitForReply } = require(Runtime.getFunctions()[
  'features/post-task-survey/sendOutboundMessageAndWaitForReply'
].path);
const { createOutboundCustomerConversation } = require(Runtime.getFunctions()[
  'features/post-task-survey/helpers/conversations_helper'
].path);

exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const { TWILIO_FLEX_WORKSPACE_SID } = context;
  const responseHelper = new TwilioHelper();
  const {
    taskSid,
    conversationSid,
    surveyWorkflowSid,
    whatsappSurveyContentSid,
    whatsappSurveyMessage,
    whatsappNumber,
    whatsappInboundStudioFlow,
  } = event;

  try {
    console.log('Sending Post Task Survey (chat)...', taskSid, conversationSid);

    const task = await client.taskrouter.v1.workspaces(TWILIO_FLEX_WORKSPACE_SID).tasks(taskSid).fetch();
    const taskAttributes = JSON.parse(task.attributes);
    const outboundMessageParams = {
      To: taskAttributes.from,
      From: whatsappNumber,
      Body: whatsappSurveyMessage,
      WorkerSid: '',
      WorkerFriendlyName: '',
      WorkspaceSid: TWILIO_FLEX_WORKSPACE_SID,
      InboundStudioFlow: whatsappInboundStudioFlow,
      ContentTemplateId: whatsappSurveyContentSid,
      Token: event.Token,
    };

    await sendOutboundMessage(context, outboundMessageParams);
    console.log('Survey Message sent');

    const reservations = await client.taskrouter.v1
      .workspaces(TWILIO_FLEX_WORKSPACE_SID)
      .tasks(taskSid)
      .reservations.list();

    console.log('got reservations');

    const reservationStatus = ['completed', 'accepted', 'wrapping'];

    const acceptedReservation = reservations.find((reservation) =>
      reservationStatus.includes(reservation.reservationStatus),
    );

    console.log('got accepted reservation', acceptedReservation.sid);

    const originalAttributes = JSON.parse(task.attributes);

    if (!originalAttributes.conversations) {
      originalAttributes.conversations = {};
    }

    if (!originalAttributes.customers) {
      originalAttributes.customers = {};
    }

    originalAttributes.conversations.conversation_id = taskSid;
    originalAttributes.conversations.case = 'IniciouCSAT';
    originalAttributes.conversations.kind = 'Survey';
    originalAttributes.customers.customer_manager = acceptedReservation.workerName;

    const agents = {
      agent_id: acceptedReservation.workerSid,
      full_name: acceptedReservation.workerName,
    };

    const newAttributes = {
      ...originalAttributes,
      conversationSid,
      agents,
    };

    const taskSurvey = await client.taskrouter.v1.workspaces(TWILIO_FLEX_WORKSPACE_SID).tasks.create({
      attributes: JSON.stringify(newAttributes),
      workflowSid: surveyWorkflowSid,
      taskChannel: 'survey',
      timeout: 1800,
    });
    console.log('Survey Task Created', taskSurvey.sid);

    const response = responseHelper.defaultResponse();
    response.setBody({
      message: 'Survey successfully sent',
      surveyTask: taskSurvey.sid,
    });
    console.log('successfully sent survey');
    return callback(null, response);
  } catch (err) {
    console.error('could not send survey');
    console.error(err);
    const response = responseHelper.genericErrorResponse(err.message);
    return callback(response);
  }
};

const sendOutboundMessage = async (context, outboundMessageParams) => {
  const { To, From, Body, WorkspaceSid, WorkerSid, WorkerFriendlyName, InboundStudioFlow, ContentTemplateId } =
    outboundMessageParams;

  const client = context.getTwilioClient();

  try {
    let customerConversation = undefined;
    let reusingExistingConversation = false;

    // either create a new conversation or if there is already an active conversation in progress
    // then get its details and depending on outbound scenario we may be able to re-use it
    const { newConversation, existingConversationDetails } = await createOutboundCustomerConversation(
      client,
      WorkspaceSid,
      To,
      From,
    );

    // Handle existing conversation in progress
    if (existingConversationDetails) {
      if (existingConversationDetails.taskExists) {
        console.error('There was already an active conversation and a task for this customer - cannot reuse it');
      } else {
        // For the scenario where:
        // "We are waiting until the customer replies before creating a task &&
        // there is an existing conversation &&
        // existing conversation is waiting for customer to reply before creating a task"
        //
        // Then we are OK to re-use the existing channel and add messages to it
        console.log(
          'There was already an active conversation waiting for customer to reply - reuse it',
          existingConversationDetails.conversation.sid,
        );

        customerConversation = existingConversationDetails.conversation;
        reusingExistingConversation = true;
      }
    } else {
      customerConversation = newConversation;
    }

    // We have a conversation resource to use. Check if we are a send and wait for reply sceanrio
    // or if we need to use Interactins API to creaet a task.

    await sendOutboundMessageAndWaitForReply(
      client,
      customerConversation,
      Body,
      false,
      '',
      '',
      InboundStudioFlow,
      reusingExistingConversation,
      ContentTemplateId,
    );
  } catch (err) {
    // If there's an error, send an error response
    // Keep using the response object for CORS purposes
    console.error(err);
  }
};
