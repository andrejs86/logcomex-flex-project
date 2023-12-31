import { Actions, Manager, Notifications, StateHelper, TaskHelper } from '@twilio/flex-ui';

import { TransferActionPayload } from '../types/ActionPayloads';
import { NotificationIds } from '../flex-hooks/notifications/TransferResult';
import ChatTransferService, { buildInviteParticipantAPIPayload } from '../helpers/APIHelper';
import { isColdTransferEnabled, isMultiParticipantEnabled } from '../config';
import { countOfOutstandingInvitesForConversation } from '../helpers/inviteTracker';

const handleChatTransferAction = async (payload: TransferActionPayload) => {
  const { task, targetSid } = payload;
  const conversation = StateHelper.getConversationStateForTask(task);

  console.log('transfer started', payload);

  if (conversation && countOfOutstandingInvitesForConversation(conversation) !== 0) {
    Notifications.showNotification(NotificationIds.ChatCancelParticipantInviteFailedInviteOutstanding);
    return;
  }

  if (payload?.options?.mode === 'WARM' && !isMultiParticipantEnabled()) {
    Notifications.showNotification(NotificationIds.ChatTransferFailedConsultNotSupported);
    return;
  }

  if (payload?.options?.mode === 'COLD' && !isColdTransferEnabled()) {
    Notifications.showNotification(NotificationIds.ChatTransferFailedColdNotSupported);
    return;
  }

  const removeInvitingAgent = payload?.options?.mode === 'COLD';
  const transferChatAPIPayload = await buildInviteParticipantAPIPayload(task, targetSid, removeInvitingAgent);

  if (!transferChatAPIPayload) {
    Notifications.showNotification(NotificationIds.ChatTransferFailedGeneric);
    return;
  }

  if ((transferChatAPIPayload.workersToIgnore as any).workerSidsInConversation.indexOf(targetSid) >= 0) {
    Notifications.showNotification(NotificationIds.ChatTransferFailedAlreadyParticipating);
    return;
  }

  try {
    await ChatTransferService.sendTransferChatAPIRequest(transferChatAPIPayload);

    if (removeInvitingAgent) {
      Notifications.showNotification(NotificationIds.ChatTransferTaskSuccess);
    } else {
      Notifications.showNotification(NotificationIds.ChatParticipantInvited);
    }

    console.log('Transfer sucessful. Adding to transfer history...');

    let transfers = payload.task.attributes?.transfers;
    if (!transfers) transfers = new Array<any>();
    const targetName = payload.targetSid.startsWith('WK')
      ? ((await Manager.getInstance().workspaceClient?.fetchWorker(payload.targetSid))?.attributes as any)?.full_name ??
        payload.targetSid
      : (await Manager.getInstance().workspaceClient?.fetchTaskQueue(payload.targetSid))?.queueName ??
        payload.targetSid;

    transfers.push({
      targetSid: payload.targetSid,
      targetName,
      workerName: Manager.getInstance().user.identity,
      workerFullName: (Manager.getInstance().workerClient?.attributes as any)?.full_name,
    });

    await payload.task.setAttributes({
      ...payload.task.attributes,
      transfers,
    });
    console.log('successfully added transfer history', transfers);
  } catch (error) {
    console.error('transfer API request failed', error);
    Notifications.showNotification(NotificationIds.ChatTransferFailedGeneric);
  }
};

export const registerCustomChatTransferAction = () => {
  Actions.registerAction('ChatTransferTask', async (payload: any) =>
    handleChatTransferAction(payload as TransferActionPayload),
  );
};
