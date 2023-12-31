import { getFeatureFlags } from '../../utils/configuration';
import SoundNotificationsConfig from './types/ServiceConfiguration';

const { enabled = false, missedAttendanceActivitySid = '' } =
  (getFeatureFlags()?.features?.sound_notifications as SoundNotificationsConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getMissedAttendanceActivitySid = () => {
  return missedAttendanceActivitySid;
};
