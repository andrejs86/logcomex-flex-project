import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent } from '../../../../types/feature-loader';

export const actionEvent = FlexActionEvent.replace;
export const actionName = 'SendMessage';

export const actionHook = function addAgentNameToConversation(flex: typeof Flex, manager: Flex.Manager) {
  flex.Actions.replaceAction(`${actionName}`, async (payload, original) => {
    const newPayload = payload;
    if ((manager.workerClient?.attributes as any)?.full_name) {
      newPayload.body = `*${(manager.workerClient?.attributes as any).full_name}:* \n${payload.body}`;
    }
    original(newPayload);
  });
};
