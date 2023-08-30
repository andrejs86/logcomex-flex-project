import * as Flex from '@twilio/flex-ui';
import { NotificationType } from '@twilio/flex-ui';

export const notificationHook = (_flex: typeof Flex, _manager: Flex.Manager) => [
  {
    id: 'saveHistoryFailed',
    content: 'Falha ao salvar os dados de histórico no Hubspot',
    type: NotificationType.error,
  },
  {
    id: 'saveHistoryResponseFailed',
    content: 'Erro para vincular o contato - Cadastro não encontrado no Hubspot',
    type: NotificationType.error,
  },
  {
    id: 'saveHistorySuccess',
    content: 'Histórico da tarefa salvo corretamente no Hubspot',
    type: NotificationType.success,
    timeout: 3000,
  },
  {
    id: 'notificationOfflineAgent',
    content: 'Você está indisponível para atendimento de tarefas, verifique o seu status! - Clique no [x] para fechar',
    timeout: 0,
    type: NotificationType.warning,
  },
  {
    id: 'notificationOpenConversation',
    content: 'Você possui atendimentos em aberto ! - Clique no [x] para fechar',
    timeout: 0,
    type: NotificationType.warning,
  },
  {
    id: 'reservationNotAccepted',
    content: 'Novo atendimento sem reserva ! - Clique no [x] para fechar',
    timeout: 0,
    type: NotificationType.warning,
  },
  {
    id: 'changeToActivityNotAttendance',
    content:
      'Sua atividade foi alterada para Falta de Atendimento, pois você não atendeu a tarefa reservada para o seu usuário.',
    timeout: 0,
    type: NotificationType.warning,
  },
];
