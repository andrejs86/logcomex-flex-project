import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../types/feature-loader';
import WhatsappSenderView from '../custom-components/WhatsappSenderView';

export const componentName = FlexComponent.ViewCollection;
export const componentHook = function addWhatsappSenderView(flex: typeof Flex, manager: Flex.Manager) {
  flex.ViewCollection.Content.add(
    <Flex.View name="whatsapp-view" key="whatsapp-view">
      <WhatsappSenderView key="co-whatsapp-view" manager={manager} />
    </Flex.View>,
  );
};
