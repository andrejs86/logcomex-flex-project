import { getFeatureFlags } from '../../utils/configuration';
import WhatsappSenderConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.whatsapp_sender as WhatsappSenderConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
