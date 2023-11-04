import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import OutboundHelper from '../../utils/OutboundHelper';
import HubspotService from '../../utils/HubspotService';

export const actionEvent = FlexActionEvent.replace;
export const actionName = FlexAction.StartOutboundCall;
export const actionHook = function replaceStartOutboundCall(flex: typeof Flex, manager: Flex.Manager) {
  flex.Actions.replaceAction(actionName, async (payload, original) => {
    console.log(`Starting Outbound call to ${payload.destination}`);
    const client = await HubspotService.SearchClientByPhone(payload.destination);
    if (client.success) {
      console.log('Client information successfully retrieved', client);
      let clientName = client.data.properties.firstname;
      if (typeof client.data.properties.lastname === 'string' || client.data.properties.lastname instanceof String) {
        clientName += ` ${client.data.properties.lastname}`;
      }
      payload.taskAttributes = {
        name: clientName,
        clientInformation: client.data.properties,
      };
    } else {
      console.error('Could not retrieve customer data');
    }

    const newPayload = await OutboundHelper.StartOutboundCall(payload, flex, manager);

    original(newPayload);
  });
};
