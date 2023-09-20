exports.handler = async (context, event, callback) => {
  const client = context.getTwilioClient();
  const response = new Twilio.twiml.VoiceResponse();
  const { TWILIO_FLEX_WORKSPACE_SID } = context;
  const { taskSid, Digits } = event;
  const validDigits = '12345'.split('');

  try {
    // this action will create a callback loop until a valid answer is input.
    // If you wish to ignore invalid answers, just hang up the call.
    // If you wish to implement a retryCount, you can pass it as a query param and evaluate it in the callback
    if (!validDigits.includes(Digits)) {
      const gather = response.gather({
        timeout: 10,
        numDigits: 1,
        language: 'pt-BR',
        action: `/process-voice-survey?taskSid=${taskSid}`,
      });

      gather.say(
        {
          language: 'pt-BR',
          voice: 'Polly.Camila-Neural',
        },
        'Ops, não entendi sua resposta, digite uma nota de 1 a 5, sendo 5 para muito bom e 1 muito ruim',
      );

      return callback(null, response);
    }

    const task = await client.taskrouter.v1.workspaces(TWILIO_FLEX_WORKSPACE_SID).tasks(taskSid).fetch();

    let conv = {};
    const originalAttributes = JSON.parse(task.attributes);

    if (originalAttributes.conversations) {
      conv = originalAttributes.conversations;
    }

    // eslint-disable-next-line radix
    conv.conversation_measure_1 = parseInt(Digits) || 0;
    conv.conversation_attribute_8 = 'FinalizouCSAT';

    const newAttributes = {
      ...originalAttributes,
      conversations: conv,
    };

    await client.taskrouter.v1
      .workspaces(TWILIO_FLEX_WORKSPACE_SID)
      .tasks(task.sid)
      .update({
        attributes: JSON.stringify(newAttributes),
      });

    await client.taskrouter.v1.workspaces(TWILIO_FLEX_WORKSPACE_SID).tasks(task.sid).update({
      assignmentStatus: 'canceled',
      reason: 'CSAT saved',
    });

    response.say(
      {
        language: 'pt-BR',
        voice: 'Polly.Camila-Neural',
      },
      'A Logcomex agradece o seu contato! Até a próxima!',
    );

    return callback(null, response);
  } catch (err) {
    console.log(err.message);
    return callback(err);
  }
};
