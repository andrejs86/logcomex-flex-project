import { getFeatureFlags } from '../../utils/configuration';
import LogcomexThemeConfig from './types/ServiceConfiguration';

const {
  enabled = false,
  hubspotInstanceId = '23315776',
  logoUrl = 'https://drab-newt-3733.twil.io/assets/LOGCOMEX%20-%20novo_logo_H_TM_negativo_fundo_roxo.png',
  whatsappNotificationUrl = 'https://drab-newt-3733.twil.io/assets/meet-message.mp3',
} = (getFeatureFlags()?.features?.logcomex_theme as LogcomexThemeConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getHubspotInstanceId = () => {
  return hubspotInstanceId;
};

export const getLogoUrl = () => {
  return logoUrl;
};

export const getWhatsappNotificationUrl = () => {
  return whatsappNotificationUrl;
};
