function getDifferenceData(updatedTime) {
  const nowDate = new Date();
  const startedDate = new Date(updatedTime);

  return Math.floor((nowDate.getTime() - startedDate.getTime()) / 1000);
}

exports.handler = async (context, event, callback) => {
  try {
    const client = context.getTwilioClient();

    const twilioResponse = new Twilio.Response();
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    twilioResponse.setHeaders(headers);

    const tasks = await client.taskrouter.v1.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).tasks.list({
      assignmentStatus: `wrapping`,
    });

    for (const task of tasks) {
      const differenceTime = getDifferenceData(task.dateUpdated);

      if (differenceTime >= 60) {
        // < 1 minuto finaliza a task
        await client.taskrouter.workspaces(context.TWILIO_FLEX_WORKSPACE_SID).tasks(task.sid).update({
          assignmentStatus: `completed`,
        });
        console.log(`Finalizou task, SID: ${task.sid}`);
      }
    }

    twilioResponse.setBody('success');
    return callback(null, twilioResponse);
  } catch (error) {
    console.log(error);
    console.log('could not complete task');
    return callback(error, error.message);
  }
};
