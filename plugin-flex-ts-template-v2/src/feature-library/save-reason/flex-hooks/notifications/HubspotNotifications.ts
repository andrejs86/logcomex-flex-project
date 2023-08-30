import * as Flex from '@twilio/flex-ui';
import { NotificationType } from '@twilio/flex-ui';

export enum NotificationIds {
  CreateTicketError = 'createTicketHubSpotError',
  ClientUndefinedError = 'clientUndefinedHubSpotError',
  HistorySaveSuccess = 'historySaveHubSpotSuccess',
}

export const notificationHook = (_flex: typeof Flex, _manager: Flex.Manager) => [
  {
    id: NotificationIds.CreateTicketError,
    type: NotificationType.error,
    content: 'Erro ao criar ticket no HubSpot',
    closeButton: true,
    timeout: 5000,
  },
  {
    id: NotificationIds.ClientUndefinedError,
    type: NotificationType.error,
    content: 'Cliente não localizado, verifique os dados digitados',
    closeButton: true,
    timeout: 5000,
  },
  {
    id: NotificationIds.HistorySaveSuccess,
    type: NotificationType.success,
    content: 'Histórico da tarefa gravado no Hubspot com sucesso',
    closeButton: false,
    timeout: 5000,
  },
];
