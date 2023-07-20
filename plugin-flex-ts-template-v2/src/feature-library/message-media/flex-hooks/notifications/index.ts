import * as Flex from '@twilio/flex-ui';
import { NotificationType } from '@twilio/flex-ui';

// Return an array of Flex.Notification
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notificationHook = (flex: typeof Flex, _manager: Flex.Manager) => [
  {
    id: 'recordAudioError',
    content: 'Para usar a gravação de áudio você precisa permitir que o Flex use seu microfone',
    type: NotificationType.error,
    timeout: 5000,
  },
];
