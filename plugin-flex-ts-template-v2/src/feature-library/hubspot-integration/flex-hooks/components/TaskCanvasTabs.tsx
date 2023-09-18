import * as Flex from '@twilio/flex-ui';
import { WorkerDirectoryTabs } from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader';

export const componentName = FlexComponent.TaskCanvasHeader;
export const componentHook = function addHubspotModal(_flex: typeof Flex, _manager: Flex.Manager) {
  Flex.TaskCanvasTabs.Content.add(<WorkerDirectoryTabs key="task-transfer-without-accept" />, {
    if: (props) => props.task.status === 'pending' && props.task.channelType === 'whatsapp',
  });
};
