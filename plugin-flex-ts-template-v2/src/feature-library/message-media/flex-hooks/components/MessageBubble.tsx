import * as Flex from '@twilio/flex-ui';

import BubbleMessageWrapper from '../../custom-components/BubbleMessageWrapper/BubbleMessageWrapper';

export const componentName = 'MessageBubble';
export const componentHook = function addToMessageBubble(flex: typeof Flex, _manager: Flex.Manager) {
  flex.MessageBubble.Content.add(<BubbleMessageWrapper key="image" />);
};
