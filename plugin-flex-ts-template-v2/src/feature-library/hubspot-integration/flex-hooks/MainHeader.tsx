import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../types/feature-loader';
import { changeFlexComponents } from '../utils/changeFlexComponents';
import HubspotModal from '../custom-components/HubspotModal';

export const componentName = FlexComponent.MainHeader;
export const componentHook = function addHubspotModal(flex: typeof Flex, manager: Flex.Manager) {
  changeFlexComponents(flex, manager);

  flex.MainHeader.Content.add(<HubspotModal key="custom-modal-hubspot" worker={manager.workerClient} />, {
    sortOrder: 4,
  });
};
