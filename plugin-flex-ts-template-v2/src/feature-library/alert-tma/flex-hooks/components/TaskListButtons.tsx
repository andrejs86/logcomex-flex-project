import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader';
import AlertTmaButton from '../../custom-components/AlertTMAButton/AlertTmaButton';

export const componentName = FlexComponent.TaskListButtons;
export const componentHook = function addTmaButton(flex: typeof Flex, manager: Flex.Manager) {
  flex.TaskListButtons.Content.add(<AlertTmaButton manager={manager} key="alert-tma-button" />);
};
