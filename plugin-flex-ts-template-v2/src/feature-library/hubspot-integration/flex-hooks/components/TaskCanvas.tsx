import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader';
import TaskJourney from '../../custom-components/TaskJourney/TaskJourney';

export const componentName = FlexComponent.TaskCanvasHeader;
export const componentHook = function addHubspotModal(flex: typeof Flex, manager: Flex.Manager) {
  Flex.TaskCanvas.Content.add(<TaskJourney key={`TaskJourney`} manager={manager} />, { sortOrder: -1 });
};
