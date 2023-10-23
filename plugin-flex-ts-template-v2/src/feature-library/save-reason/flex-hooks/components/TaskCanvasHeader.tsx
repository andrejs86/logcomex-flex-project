import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader';
import { SaveTaskDetails } from '../../custom-components/SaveTaskDetails';
import TaskReasonModal from '../../custom-components/TaskReasonModal';

export const componentName = FlexComponent.TaskCanvasHeader;
export const componentHook = function addSaveTaskDetails(flex: typeof Flex, _manager: Flex.Manager) {
  const propsComponent = {
    if: (props: any) => props.task.taskStatus === 'assigned' || props.task.taskStatus === 'wrapping',
    sortOrder: 1,
  };
  flex.TaskCanvasHeader.Content.add(<SaveTaskDetails key="save-task-details" />, propsComponent);
  flex.TaskCanvasHeader.Content.add(<TaskReasonModal key="task-reason-modal" flex={flex} />);
};
