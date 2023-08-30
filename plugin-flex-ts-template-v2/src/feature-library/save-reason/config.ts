import { getFeatureFlags } from '../../utils/configuration';
import SaveReasonConfig from './types/ServiceConfiguration';

const {
  enabled = false,
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

export const getReasonsByTopic = (topic: string) => {
  return reasons.find((r) => r.topic === topic)?.options;
};

export const getAllReasons = () => {
  return reasons;
};
