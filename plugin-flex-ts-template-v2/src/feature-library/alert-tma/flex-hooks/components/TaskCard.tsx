import * as Flex from '@twilio/flex-ui';

import AlertTmaButtonSupervisor from '../../custom-components/AlertTMAButtonSupervisor/AlertTmaButtonSupervisor';

export const componentName = 'TaskCard';
export const componentHook = function addTmaButtonSupervisor(flex: typeof Flex, manager: Flex.Manager) {
  flex.TaskCard.Content.add(<AlertTmaButtonSupervisor manager={manager} key="alert-tma-supervisor-button" />);
};
