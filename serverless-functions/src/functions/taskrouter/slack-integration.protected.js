const { WebClient } = require('@slack/web-api');

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With, User-Agent',
  );
  response.appendHeader('Vary', 'Origin');

  const workerAttributes = event.WorkerAttributes && JSON.parse(event.WorkerAttributes);
  const taskAttributes = event.TaskAttributes && JSON.parse(event.TaskAttributes);
  const slack = new WebClient(context.SLACK_TOKEN);
  const workerEmail = workerAttributes && workerAttributes.email;
  const supervisorEmail = workerAttributes && workerAttributes.supervisor && workerAttributes.supervisor;
  const guardianEmail =
    taskAttributes.clientInformation &&
    taskAttributes.clientInformation.guardian &&
    taskAttributes.clientInformation.guardian;

  switch (event.EventType) {
    case 'reservation.created':
      if (workerEmail && taskAttributes.direction !== 'outbound') {
        const worker = await slack.users.lookupByEmail({ email: workerEmail });

        const message = `Olá ${
          workerAttributes.full_name
        } :slightly_smiling_face:, você acaba de receber uma tarefa para atendimento do tipo ${
          event.TaskChannelUniqueName
        }.

        :telephone_receiver: O cliente *${taskAttributes.name.replace('whatsapp:', '')}* está te aguardando.

        :hourglass_flowing_sand: *Fila:* ${event.TaskQueueName}
        `;
        await slack.chat.postMessage({
          text: event.Message ? JSON.parse(event.Message) : message,
          channel: worker.user.id,
        });
      }

      if (supervisorEmail && taskAttributes.direction !== 'outbound') {
        const supervisor = await slack.users.lookupByEmail({ email: supervisorEmail });

        const supervisorMessage = `Olá :slightly_smiling_face:, o agente *${
          workerAttributes.full_name
        }* acaba de receber uma tarefa para atendimento do tipo ${event.TaskChannelUniqueName}.
        
        :telephone_receiver: O cliente *${taskAttributes.name.replace('whatsapp:', '')}* está aguardando.

        :hourglass_flowing_sand: *Fila:* ${event.TaskQueueName}
        `;
        await slack.chat.postMessage({
          text: event.SupervisorMessage ? JSON.parse(event.SupervisorMessage) : supervisorMessage,
          channel: supervisor.user.id,
        });
      }

      if (guardianEmail && taskAttributes.direction !== 'outbound') {
        const guardian = await slack.users.lookupByEmail({ email: guardianEmail });
        const guardianMessage = `Olá :slightly_smiling_face:, o cliente *${taskAttributes.name.replace(
          'whatsapp:',
          '',
        )}* entrou em contato com a Logcomex, com o tipo de atendimento - ${event.TaskChannelUniqueName}.
        
        :telephone_receiver: O cliente *${taskAttributes.name.replace(
          'whatsapp:',
          '',
        )}* está aguardando para ser atendido pelo agente *${workerAttributes.full_name}*.

        :hourglass_flowing_sand: *Fila:* ${event.TaskQueueName}
        `;
        await slack.chat.postMessage({ text: guardianMessage, channel: guardian.user.id });
      }
      return callback(null, true);
      break;

    case 'reservation.accepted':
      if (supervisorEmail && taskAttributes.direction !== 'outbound') {
        const supervisor = await slack.users.lookupByEmail({ email: supervisorEmail });

        const supervisorMessage = `Oi :slightly_smiling_face:, o agente *${
          workerAttributes.full_name
        }* atendeu a tarefa do tipo ${event.TaskChannelUniqueName}.

        :telephone_receiver: O cliente *${taskAttributes.name.replace('whatsapp:', '')}* está em atendimento.

        :hourglass_flowing_sand: *Fila:* ${event.TaskQueueName}
        `;
        await slack.chat.postMessage({ text: supervisorMessage, channel: supervisor.user.id });
      }

      return callback(null, true);
      break;

    case 'reservation.rejected':
      if (supervisorEmail && taskAttributes.direction !== 'outbound') {
        const supervisor = await slack.users.lookupByEmail({ email: supervisorEmail });

        const supervisorMessage = `:eyes: O agente *${workerAttributes.full_name}* recusou a tarefa do tipo ${
          event.TaskChannelUniqueName
        }.

        :telephone_receiver: O cliente *${taskAttributes.name.replace(
          'whatsapp:',
          '',
        )}* foi transferido para a fila novamente.

        :hourglass_flowing_sand: *Fila:* ${event.TaskQueueName}
        `;
        await slack.chat.postMessage({ text: supervisorMessage, channel: supervisor.user.id });
      }

      return callback(null, true);
      break;

    case 'reservation.timeout':
      if (supervisorEmail && taskAttributes.direction !== 'outbound') {
        const supervisor = await slack.users.lookupByEmail({ email: supervisorEmail });

        const supervisorMessage = `:eyes: O agente *${workerAttributes.full_name}* não atendeu a tarefa do tipo ${
          event.TaskChannelUniqueName
        }.

        O limite de timeout foi atingido.

        :telephone_receiver: O cliente *${taskAttributes.name.replace(
          'whatsapp:',
          '',
        )}* foi transferido para a fila novamente.

        :hourglass_flowing_sand: *Fila:* ${event.TaskQueueName}
        `;
        await slack.chat.postMessage({ text: supervisorMessage, channel: supervisor.user.id });
      }

      return callback(null, true);
      break;

    default:
      return callback(null, true);
      break;
  }
};
