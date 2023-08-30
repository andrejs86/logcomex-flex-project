import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import HubspotService from '../../utils/HubspotService';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.AcceptTask;
export const actionHook = function createTicketAfterAcceptTask(flex: typeof Flex, _manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async ({ task }) => {
    const { success, ticketId, ticketUrl, message } = await HubspotService.CreateTicket(task.attributes);

    if (!success) {
      if (message !== 'NoSupport') flex.Notifications.showNotification('createTicketHubSpotError');
      return;
    }

    await task.setAttributes({
      ...task.attributes,
      ticketId,
      ticketUrl,
    });
  });
};
