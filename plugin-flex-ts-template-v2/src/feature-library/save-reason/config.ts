import { getFeatureFlags } from '../../utils/configuration';
import SaveReasonConfig from './types/ServiceConfiguration';

const {
  enabled = false,
  everyoneQueueSid = '',
  internationalQueueSid = '',
  nationalNumber = '',
  internationalNumber = '',
  flexWorkspaceSid = '',
  authToken = '',
  customObjectConversas = '',
  typesAndOutcomesDocumentSid = '',
  wrapupTimeout = 120,
  reasons = [
    {
      topic: 'Cliente Logcomex',
      options: ['Problemas', 'Dúvidas', 'Solicitação de Serviços', 'Solicitação Geral'],
    },
    {
      topic: 'Não cliente Logcomex',
      options: ['Orçamento', 'Dúvidas', 'Apresentação'],
    },
  ],
} = (getFeatureFlags()?.features?.save_reason as SaveReasonConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getNationalNumber = () => {
  return nationalNumber;
};

export const getEveryoneQueueSid = () => {
  return everyoneQueueSid;
};

export const getInternationalQueueSid = () => {
  return internationalQueueSid;
};

export const getReasonsByTopic = (topic: string) => {
  return reasons.find((r) => r.topic === topic)?.options;
};

export const getAuthToken = () => {
  return authToken;
};

export const getInternationalNumber = () => {
  return internationalNumber;
};

export const getFlexWorkspaceSid = () => {
  return flexWorkspaceSid;
};

export const getAllReasons = () => {
  return reasons;
};

export const getWrapupTimeout = () => {
  return wrapupTimeout;
};

export const getCustomObjectConversas = () => {
  return customObjectConversas;
};

export const getTypesAndOutcomesDocumentSid = () => {
  return typesAndOutcomesDocumentSid;
};
