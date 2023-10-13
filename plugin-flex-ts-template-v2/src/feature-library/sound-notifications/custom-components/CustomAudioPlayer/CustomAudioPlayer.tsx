import React, { useRef } from 'react';
import * as Flex from '@twilio/flex-ui';
import { VolumeOnIcon } from '@twilio-paste/icons/esm/VolumeOnIcon';
import { Button } from '@twilio-paste/button';
import axios from 'axios';

import * as config from '../../config';

const CANCELED_STATUS = 'canceled';

const isCanceled = (reservation: any) =>
  reservation.status === CANCELED_STATUS || reservation.task.status === CANCELED_STATUS;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateGuardian = (reservation: any) => {
  return (
    reservation?.task?.attributes &&
    reservation?.task?.attributes?.conversations &&
    reservation?.task?.attributes?.conversations.conversation_attribute_2 !== reservation._worker.attributes?.full_name
  );
};

const CustomAudioPlayer = () => {
  const mediaId = useRef('');

  const manager = Flex.Manager.getInstance();
  const custom_config = (Flex.Manager.getInstance().configuration as any)?.custom_data;
  const protocol = custom_config?.serverless_functions_protocol ?? 'https';
  const domain = custom_config?.serverless_functions_domain;
  let port = custom_config?.serverless_functions_port;
  port = port ? `:${port}` : '';

  if (!protocol || !domain) {
    console.log('Serverless Functions Domain not set on config!', `${protocol}://${domain}${port}/`);
    return <></>;
  }

  manager.workerClient?.on('reservationCreated', async (reservation) => {
    async function playAudio() {
      if (reservation.task.attributes.direction === 'inbound') {
        const audioURL = `${protocol}://${domain}${port}/features/sound-notifications/alert_task_incoming.mp3`;
        if (mediaId.current === '') {
          const newMediaId = Flex.AudioPlayerManager.play({
            url: audioURL,
            repeatable: true,
          });
          console.log(`playing new mediaId = '${newMediaId}'`);
          mediaId.current = newMediaId;
        }
      }
    }

    if (!isCanceled(reservation)) {
      await playAudio();
    }

    const reservationEvents = [
      'accepted',
      'canceled',
      'completed',
      'rejected',
      'rescinded',
      'timeout',
      'wrapup',
      'wrapping',
    ];

    const stopAudio = () => {
      setTimeout(() => {
        Flex.AudioPlayerManager.stop(mediaId.current);
        console.log(`parou o áudio (reservationEvent - mediaId= '${mediaId.current}').`);
        mediaId.current = '';
      }, 1000);
    };

    reservationEvents.forEach((eventName) => {
      reservation.addListener(eventName, stopAudio);
    });

    reservation.on('canceled', (_res: any) => {
      Flex.AudioPlayerManager.stop(mediaId.current);
      console.log(`parou o áudio (reservation canceled - mediaId= '${mediaId.current}').`);
      mediaId.current = '';
    });

    const showNotification = () => {
      // create a new notification
      const notification = new Notification('Cliente aguardando atendimento', {
        body: '',
      });

      // close the notification after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10 * 1000);
    };

    if (reservation?.task?.attributes?.direction !== 'outbound') {
      // await slackNotification(reservation);
      showNotification();
    }

    if (!reservation.task || !reservation.task.attributes || !reservation.task.attributes.clientInformation)
      return <></>;

    if (reservation.task.attributes.clientNumber) return <></>;

    const clientInfo = reservation.task.attributes.clientInformation;

    const clientNumber = reservation?.task?.attributes?.name
      ? reservation?.task?.attributes?.name.replace('whatsapp:', '')
      : reservation?.task?.attributes?.from;

    let hubspotNameAndNumber = clientNumber;

    if (clientInfo.firstname) {
      hubspotNameAndNumber = `${clientInfo.firstname} ${clientInfo.lastname} (${clientNumber})`;
    }
    reservation.task.setAttributes({
      ...reservation.task.attributes,
      name: hubspotNameAndNumber,
      clientNumber: `whatsapp:${clientNumber}`,
    });

    return true;
  });

  /* notification for already opened conversations */
  manager.conversationsClient.on('messageAdded', async (payload) => {
    const audioURL = `${protocol}://${domain}${port}/features/sound-notifications/message_incoming.mp3`;

    if (payload?.author?.includes('whatsapp')) {
      Flex.AudioPlayerManager.play({
        url: audioURL,
        repeatable: false,
      });
      console.log('message alert played (repeat= false).');
    }

    const loggedWorkerName = manager.workerClient?.name.replace(/(_2E)/g, '.').replace('_40', '@');
    const participants = await payload.conversation.getParticipants();
    const member = participants.find((p) => p.type !== 'guest');
    const memberIdentity = member?.identity;

    if (memberIdentity === manager.workerClient?.name) {
      const authorFormatted = payload.author?.replace(/(_2E)/g, '.').replace('_40', '@');
      const onLoadSelectedTask = window.location.pathname.split('/').find((item) => item.includes('WR'));

      if (authorFormatted === loggedWorkerName) return <></>;
      if (onLoadSelectedTask) return <></>;

      Flex.Notifications.showNotification('notificationOpenConversation');
    }

    return true;
  });

  const voiceClientEvents = ['cancel', 'disconnect', 'reject'];

  voiceClientEvents.forEach((eventName) => {
    manager.voiceClient.on(eventName, async (_payload) => {
      Flex.AudioPlayerManager.stop(mediaId.current);
      console.log(`parou o áudio (voiceEvents - mediaId= '${mediaId.current}').`);
      mediaId.current = '';
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const slackNotification = async (reservation: any) => {
    const baseUrlTaskRouter = `${protocol}://${domain}${port}/utils/taskrouter_callback_handler`;
    const WorkerAttributes = JSON.stringify(reservation._worker.attributes);
    const TaskAttributes = JSON.stringify(reservation?.task?.attributes);
    const time = 10;

    const body = {
      WorkerAttributes,
      TaskAttributes,
      TaskChannelUniqueName: reservation?.task?.taskChannelUniqueName,
      TaskQueueName: reservation?.task?.queueName,
    };

    const clientName = reservation?.task?.attributes?.name
      ? reservation?.task?.attributes?.name.replace('whatsapp:', '')
      : reservation?.task?.from;

    const Message =
      JSON.stringify(`:eyes: Já se passaram ${time} minutos e você ainda está com uma tarefa para atendimento do tipo ${reservation?.task?.taskChannelUniqueName}.

      :telephone_receiver: O cliente *${clientName}* está sendo transferido para outra fila.

      :hourglass_flowing_sand: *Fila:* ${reservation?.task?.queueName}`);

    const SupervisorMessage =
      JSON.stringify(`:eyes: Já se passaram ${time} minutos e o agente ${reservation._worker.attributes?.full_name} ainda está com uma tarefa para atendimento do tipo ${reservation?.task?.taskChannelUniqueName}.

      :telephone_receiver: O cliente *${clientName}* está sendo transferido para outra fila.

      :hourglass_flowing_sand: *Fila:* ${reservation?.task?.queueName}`);

    setTimeout(() => {
      if (reservation.status === 'pending') {
        Flex.Actions.invokeAction('SetActivity', { activitySid: config.getMissedAttendanceActivitySid() });
        Flex.Notifications.showNotification('changeToActivityNotAttendance');
        axios.post(baseUrlTaskRouter, { ...body, EventType: 'reservation.created', Message, SupervisorMessage });
      }
    }, 60000 * 10); // 10 minutos

    if (validateGuardian(reservation)) {
      const GuardianMessage =
        JSON.stringify(`Olá ${reservation?.task?.attributes?.clientInformation.guardian} :slightly_smiling_face:, o cliente *${clientName}* abriu uma tarefa para atendimento do tipo ${reservation?.task?.taskChannelUniqueName}.

        :telephone_receiver: O cliente *${clientName}* está sendo atendido pelo agente ${reservation._worker.attributes?.full_name}.

        :hourglass_flowing_sand: *Fila:* ${reservation?.task?.queueName}`);

      axios.post(baseUrlTaskRouter, { ...body, Message, EventType: 'reservation.message.guardian', GuardianMessage });
    }
  };

  return (
    <Button
      variant="secondary_icon"
      className="button-stop-audio"
      key="custom-pause-audio"
      onClick={async () => {
        Flex.AudioPlayerManager.stop(mediaId.current);
        console.log(`parou o áudio (manual - mediaId= '${mediaId.current}').`);
        mediaId.current = '';
      }}
    >
      <VolumeOnIcon decorative={false} title="Parar áudio" size="sizeIcon40" color="colorTextBrandInverse" />
    </Button>
  );
};

export default CustomAudioPlayer;
