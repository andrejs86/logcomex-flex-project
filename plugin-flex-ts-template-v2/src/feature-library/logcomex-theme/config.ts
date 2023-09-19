import { getFeatureFlags } from '../../utils/configuration';
import LogcomexThemeConfig from './types/ServiceConfiguration';

const {
  enabled = false,
  hubspotInstanceId = '',
  logoUrl = '',
  whatsappNotificationUrl = '',
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
