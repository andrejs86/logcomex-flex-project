import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader';
import CustomQueueSelect from '../../custom-components/CustomQueueSelect';

export const componentName = FlexComponent.OutboundDialerPanel;
export const componentHook = function replaceOutboundDialerQueueSelect(flex: typeof Flex, manager: Flex.Manager) {
  if (manager.workerClient) {
    const skills =
      (manager.workerClient.attributes as any)?.routing && (manager.workerClient.attributes as any)?.routing.skills;

    const options = { sortOrder: 3 };
    flex.OutboundDialerPanel.Content.remove('queue-select');
    flex.OutboundDialerPanel.Content.add(<CustomQueueSelect key="customQueueSelectDialpad" skills={skills} />, options);

    flex.Notifications.registerNotification({
      id: 'WithoutSkills',
      type: flex.NotificationType.information,
      backgroundColor: 'rgb(255, 110, 55)',
      timeout: 0,
      content: 'Você está sem skill, consulte o seu supervisor',
    });
  }
};
