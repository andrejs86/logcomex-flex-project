import * as Flex from '@twilio/flex-ui';
import { Provider } from '@rollbar/react';

import { FlexComponent } from '../../../../types/feature-loader';
import { SaveTaskDetails } from '../../custom-components/SaveTaskDetails';
import TaskReasonModal from '../../custom-components/TaskReasonModal';

export const componentName = FlexComponent.TaskCanvasHeader;
export const componentHook = function addSaveTaskDetails(flex: typeof Flex, _manager: Flex.Manager) {
  const rollbarConfig = {
    accessToken: '675268f348b14824a35d3d23d3577115',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      client: {
        javascript: {
          code_version: '1.0.0',
          source_map_enabled: true,
        },
      },
    },
  };

  const propsComponent = {
    if: (props: any) => props.task.taskStatus === 'assigned' || props.task.taskStatus === 'wrapping',
    sortOrder: 1,
  };
  flex.TaskCanvasHeader.Content.add(
    <Provider config={rollbarConfig}>
      <SaveTaskDetails key="save-task-details" />
    </Provider>,
    propsComponent,
  );
  flex.TaskCanvasHeader.Content.add(
    <Provider config={rollbarConfig}>
      <TaskReasonModal key="task-reason-modal" flex={flex} />
    </Provider>,
  );
};
