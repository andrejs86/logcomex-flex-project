import * as Flex from '@twilio/flex-ui';
import { TaskHelper } from '@twilio/flex-ui';
import { Conversation } from '@twilio/conversations';

import { FlexJsClient, ConversationEvent } from '../../../../types/feature-loader';

export const clientName = FlexJsClient.conversationsClient;
export const eventName = ConversationEvent.conversationJoined;
export const jsClientHook = function exampleConversationJoinedHandler(
  flex: typeof Flex,
  manager: Flex.Manager,
  conversation: Conversation,
) {
  const task = TaskHelper.getTaskFromConversationSid(conversation.sid);
  if (task?.attributes?.subject === 'comes-from-template') return;

  console.log(conversation);

  setTimeout(() => {
    if (conversation && conversation.sid) {
      const body = `Olá, sou *${
        (manager?.workerClient?.attributes as any).full_name
      }* e vou cuidar do seu atendimento a partir de agora! 😄`;

      flex.Actions.invokeAction('SendMessage', {
        conversationSid: conversation.sid,
        body,
      });
    }
  }, 1500);
};
