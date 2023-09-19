import { getFeatureFlags } from '../../utils/configuration';
import HubspotIntegrationConfig from './types/ServiceConfiguration';

const {
  enabled = false,
  internationalQueueSid = '',
  everyoneQueueSid = '',
} = (getFeatureFlags()?.features?.hubspot_integration as HubspotIntegrationConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getInternationalQueueSid = () => {
  return internationalQueueSid;
};

export const getEveryoneQueueSid = () => {
  return everyoneQueueSid;
};