import * as Flex from '@twilio/flex-ui';
import { Provider } from '@rollbar/react';

import { FlexComponent } from '../../../types/feature-loader';
import WhatsappSenderView from '../custom-components/WhatsappSenderView';

export const componentName = FlexComponent.ViewCollection;
export const componentHook = function addWhatsappSenderView(flex: typeof Flex, manager: Flex.Manager) {
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

  flex.ViewCollection.Content.add(
    <Provider config={rollbarConfig} key="rollbar-wa-sender">
      <Flex.View name="whatsapp-view" key="whatsapp-view">
        <WhatsappSenderView key="co-whatsapp-view" manager={manager} />
      </Flex.View>
    </Provider>,
  );
};
