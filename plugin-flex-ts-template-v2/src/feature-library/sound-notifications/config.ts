import { getFeatureFlags } from '../../utils/configuration';
import SoundNotificationsConfig from './types/ServiceConfiguration';

const { enabled = true } = (getFeatureFlags()?.features?.sound_notifications as SoundNotificationsConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
