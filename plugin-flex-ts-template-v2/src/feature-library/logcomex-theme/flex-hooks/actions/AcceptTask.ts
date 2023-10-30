import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;

export const actionHook = function sendWelcomeMessage(flex: typeof Flex, manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, (payload: any) => {
    if (payload.task?.attributes?.subject === 'comes-from-template') return;
    if (payload.task?.channelType === 'voice') return;

    const conversationSid = payload.task.attributes?.conversationSid ?? payload.task.attributes?.channelSid;

    setTimeout(() => {
      flex.Actions.invokeAction('SendMessage', {
        body: `Olá, sou *${
          (manager?.workerClient?.attributes as any).full_name
        }* e vou cuidar do seu atendimento a partir de agora! 😄`,
        conversationSid,
      });
    }, 1500);
  });
};
