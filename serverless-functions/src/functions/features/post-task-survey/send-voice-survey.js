const TwilioHelper = require(Runtime.getFunctions()['helpers/twilio-response'].path).TwilioHelper;

exports.handler = async (context, event, callback) => {
  const { callSid, taskSid, surveyWorkflowSid } = event;
  const { TWILIO_FLEX_WORKSPACE_SID } = context;
  const client = context.getTwilioClient();
  const twiml = new Twilio.twiml.VoiceResponse();
  const responseHelper = new TwilioHelper();

  try {
    const task = await client.v1.workspaces(TWILIO_FLEX_WORKSPACE_SID).tasks(taskSid).fetch();
    const reservations = await client.taskrouter.v1
      .workspaces(TWILIO_FLEX_WORKSPACE_SID)
      .tasks(taskSid)
      .reservations.list();
    const reservationStatus = ['completed', 'accepted', 'wrapping'];
    const acceptedReservation = reservations.find((reservation) =>
      reservationStatus.includes(reservation.reservationStatus),
    );
    const originalAttributes = JSON.parse(task.attributes);

    let convAttribute = {};
    if (originalAttributes.conversations) {
      convAttribute = originalAttributes.conversations;
    }

    let customersAttribute = {};
    if (originalAttributes.customers) {
      customersAttribute = originalAttributes.customers;
    }

    convAttribute.conversation_id = taskSid;
    convAttribute.conversation_attribute_8 = 'IniciouCSAT';
    convAttribute.kind = 'Survey';
    customersAttribute.customer_manager = acceptedReservation.workerName;

    const agents = {
      agent_id: acceptedReservation.workerSid,
      full_name: acceptedReservation.workerName,
    };

    const newAttributes = {
      ...originalAttributes,
      conversations: convAttribute,
      customers: customersAttribute,
      agents,
    };

    const taskSurvey = await client.taskrouter.v1.workspaces(TWILIO_FLEX_WORKSPACE_SID).tasks.create({
      attributes: JSON.stringify(newAttributes),
      workflowSid: surveyWorkflowSid,
      taskChannel: 'survey',
      timeout: 300,
    });
    console.log('Survey task successfully created', taskSurvey.sid);

    const gather = twiml.gather({
      timeout: 10,
      numDigits: 1,
      language: 'pt-BR',
      action: `/process-voice-survey?taskSid=${taskSurvey.sid}`,
    });

    gather.say(
      {
        language: 'pt-BR',
        voice: 'Polly.Camila-Neural',
      },
      'Antes de finalizar, deixe uma nota de 1 a 5 para o atendimento recebido, sendo 5 para muito bom e 1 para muito ruim',
    );

    await client.calls(callSid).update({ twiml: twiml.toString() });
    const response = responseHelper.defaultResponse();
    return callback(null, response);
  } catch (err) {
    const response = responseHelper.genericErrorResponse(err.message);
    return callback(response);
  }
};
