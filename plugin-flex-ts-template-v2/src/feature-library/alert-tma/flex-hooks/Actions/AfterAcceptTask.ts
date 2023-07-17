import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const actionHook = function setAlertAfterAcceptTask(flex: typeof Flex, manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, (payload) => {
    payload.task.setAttributes({
      ...payload.task.attributes,
      dateAcceptTask: new Date(),
    });
  });
};
