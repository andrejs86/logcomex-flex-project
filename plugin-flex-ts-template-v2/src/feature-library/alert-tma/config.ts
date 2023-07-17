import { getFeatureFlags } from '../../utils/configuration';
import AlertTmaConfig from './types/ServiceConfiguration';

const {
  enabled = false,
  voice_max_duration = 10,
  whatsapp_max_duration = 10,
} = (getFeatureFlags()?.features?.alert_tma as AlertTmaConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getVoiceMaxDuration = () => {
  return isFeatureEnabled() && voice_max_duration;
};

export const getWhatsappMaxDuration = () => {
  return isFeatureEnabled() && whatsapp_max_duration;
};
