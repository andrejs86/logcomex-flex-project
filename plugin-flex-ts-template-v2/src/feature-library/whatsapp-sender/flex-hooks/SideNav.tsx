import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../types/feature-loader';
import WhatsappSenderNavButton from '../custom-components/WhatsappSenderNavButton';

export const componentName = FlexComponent.SideNav;
export const componentHook = function addSideNavButton(flex: typeof Flex, _manager: Flex.Manager) {
  flex.SideNav.Content.add(<WhatsappSenderNavButton key="whatsapp-sidenav-button" activeView={undefined} />);
};
