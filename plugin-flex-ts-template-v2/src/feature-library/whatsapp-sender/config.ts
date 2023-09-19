import { getFeatureFlags } from '../../utils/configuration';
import WhatsappSenderConfig from './types/ServiceConfiguration';

const { enabled = false, hubspotApiToken = '', whatsappNumber = '+554140426460' } = (getFeatureFlags()?.features?.whatsapp_sender as WhatsappSenderConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getHubspotApiToken = () => {
  return hubspotApiToken;
};

export const getWhatsappNumber = () => {
  return whatsappNumber;
};