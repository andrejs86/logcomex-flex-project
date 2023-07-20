import { getFeatureFlags } from '../../utils/configuration';
import MessageMediaConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.message_media as MessageMediaConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
