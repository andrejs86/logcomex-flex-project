import { getFeatureFlags } from '../../utils/configuration';
import BreakExceededConfig from './types/ServiceConfiguration';

const { enabled = false, timeoutActivities = {} } =
  (getFeatureFlags()?.features?.break_exceeded as BreakExceededConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getTimeoutActivities = () => {
  return timeoutActivities;
};
