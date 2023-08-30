// import * as Flex from '@twilio/flex-ui';
// import { Icon } from '@twilio/flex-ui';
// import axios from 'axios';

// import { FlexComponent } from '../../../../types/feature-loader';
// import SaveHistoryCall from '../../custom-components/SaveHistoryCall';

// const CANCELED_STATUS = 'canceled';
// const PENDING_STATUS = 'pending';

// const isCanceled = (reservation: any) =>
//   reservation.status === CANCELED_STATUS || reservation.task.status === CANCELED_STATUS;

// const validateGuardian = (reservation: any) => {
//   return (
//     reservation?.task?.attributes &&
//     reservation?.task?.attributes?.conversations &&
//     reservation?.task?.attributes?.conversations.conversation_attribute_2 !== reservation._worker.attributes?.full_name
//   );
// };

// export const componentName = FlexComponent.MainHeader;
// export const componentHook = function addSoundControlsToMainHeader(flex: typeof Flex, manager: Flex.Manager) {
//   let mediaId: string;

//   flex.MainHeader.Content.add(
//     <button
//       className="button-stop-audio"
//       key="custom-pause-audio"
//       onClick={() => {
//         flex.AudioPlayerManager.stop(mediaId);
//       }}
//     >
//       <Icon icon="VolumeBold" />
//     </button>,
//     {
//       sortOrder: 3,
//     },
//   );

//   const slackNotification = async (reservation: any) => {
//     const baseUrlTaskRouter = `${process.env.FLEX_APP_BASE_URL_SERVERLESS_FUNCTIONS}/utils/taskrouter_callback_handler`;
//     const WorkerAttributes = JSON.stringify(reservation._worker.attributes);
//     const TaskAttributes = JSON.stringify(reservation?.task?.attributes);
//     const time = 10;

//     const body = {
//       WorkerAttributes,
//       TaskAttributes,
//       TaskChannelUniqueName: reservation?.task?.taskChannelUniqueName,
//       TaskQueueName: reservation?.task?.queueName,
//     };

//     const clientName = reservation?.task?.attributes?.name
//       ? reservation?.task?.attributes?.name.replace('whatsapp:', '')
//       : reservation?.task?.from;

//     const Message =
//       JSON.stringify(`:eyes: Já se passaram ${time} minutos e você ainda está com uma tarefa para atendimento do tipo ${reservation?.task?.taskChannelUniqueName}.

//       :telephone_receiver: O cliente *${clientName}* está sendo transferido para outra fila.

//       :hourglass_flowing_sand: *Fila:* ${reservation?.task?.queueName}`);

//     const SupervisorMessage =
//       JSON.stringify(`:eyes: Já se passaram ${time} minutos e o agente ${reservation._worker.attributes?.full_name} ainda está com uma tarefa para atendimento do tipo ${reservation?.task?.taskChannelUniqueName}.

//       :telephone_receiver: O cliente *${clientName}* está sendo transferido para outra fila.

//       :hourglass_flowing_sand: *Fila:* ${reservation?.task?.queueName}`);

//     setTimeout(() => {
//       if (reservation.status === 'pending') {
//         flex.Actions.invokeAction('SetActivity', { activitySid: process.env.FLEX_APP_NOT_ATTENDANCE_ACTIVITY });

//         flex.Notifications.showNotification('changeToActivityNotAttendance');

//         axios.post(baseUrlTaskRouter, { ...body, EventType: 'reservation.created', Message, SupervisorMessage });
//       }
//     }, 60000 * 10); // 10 minutos

//     if (validateGuardian(reservation)) {
//       const GuardianMessage =
//         JSON.stringify(`Olá ${reservation?.task?.attributes?.clientInformation.guardian} :slightly_smiling_face:, o cliente *${clientName}* abriu uma tarefa para atendimento do tipo ${reservation?.task?.taskChannelUniqueName}.

//         :telephone_receiver: O cliente *${clientName}* está sendo atendido pelo agente ${reservation._worker.attributes?.full_name}.

//         :hourglass_flowing_sand: *Fila:* ${reservation?.task?.queueName}`);

//       axios.post(baseUrlTaskRouter, { ...body, Message, EventType: 'reservation.message.guardian', GuardianMessage });
//     }
//   };

//   manager.workerClient?.on('reservationCreated', async (reservation) => {
//     async function playAudio() {
//       if (reservation.task.attributes.direction === 'inbound') {
//         mediaId = await flex.AudioPlayerManager.play({
//           url: 'https://inchworm-snail-1427.twil.io/assets/alert_task_incomming.mp3',
//           repeatable: true,
//         });
//       }
//     }

//     if (!isCanceled(reservation)) {
//       await playAudio();
//     }

//     const reservationEvents = [
//       'accepted',
//       'canceled',
//       'completed',
//       'rejected',
//       'rescinded',
//       'timeout',
//       'wrapup',
//       'wrapping',
//     ];

//     reservationEvents.forEach((eventName) => {
//       reservation.addListener(eventName, () => {
//         flex.AudioPlayerManager.stop(mediaId);
//       });
//     });

//     reservation.on('canceled', (res: any) => {
//       flex.AudioPlayerManager.stop(mediaId);

//       if (res.task.attributes.direction === 'outbound' && !res.task.transfers.incoming) {
//         flex.AgentDesktopView.Panel1.Content.add(
//           <SaveHistoryCall
//             task={res.task}
//             workerInformation={workerAttributes}
//             flex={flex}
//             isOpen={true}
//             key="save-history-call-hubspot"
//           />,
//         );
//       }
//     });

//     const showNotification = () => {
//       // create a new notification
//       const notification = new Notification('Cliente aguarda para atendimento', {
//         body: '',
//       });

//       // close the notification after 10 seconds
//       setTimeout(() => {
//         notification.close();
//       }, 10 * 1000);
//     };

//     if (reservation?.task?.attributes?.direction !== 'outbound') {
//       await slackNotification(reservation);

//       showNotification();
//     }

//     const workerAttributes = {
//       workerName: (manager.workerClient?.attributes as any).full_name,
//       workerEmail: (manager.workerClient?.attributes as any).email,
//     };

//     if (reservation.task.taskChannelUniqueName === 'chat' || reservation.task?.attributes?.channelType === 'whatsapp') {
//       flex.Actions.invokeAction('AcceptTask', { sid: reservation.sid });

//       if (reservation && reservation.status === PENDING_STATUS) {
//         setInterval(async () => {
//           if (reservation.status === PENDING_STATUS) {
//             flex.Actions.invokeAction('AcceptTask', { sid: reservation.sid });
//           }
//         }, 10000);
//       }
//     }

//     if (!reservation.task || !reservation.task.attributes || !reservation.task.attributes.clientInformation) return;

//     if (reservation.task.attributes.clientNumber) return;

//     const clientInfo = reservation.task.attributes.clientInformation;

//     const clientNumber = reservation?.task?.attributes?.name
//       ? reservation?.task?.attributes?.name.replace('whatsapp:', '')
//       : reservation?.task?.attributes?.from;

//     let hubspotNameAndNumber = clientNumber;

//     if (clientInfo.firstname) {
//       hubspotNameAndNumber = `${clientInfo.firstname} ${clientInfo.lastname} (${clientNumber})`;
//     }
//     reservation.task.setAttributes({
//       ...reservation.task.attributes,
//       name: hubspotNameAndNumber,
//       clientNumber: `whatsapp:${clientNumber}`,
//     });
//   });

//   const voiceClientEvents = ['cancel', 'disconnect', 'reject'];

//   voiceClientEvents.forEach((eventName) => {
//     manager.voiceClient.on(eventName, async (_payload) => {
//       flex.AudioPlayerManager.stop(mediaId);
//     });
//   });
// };
