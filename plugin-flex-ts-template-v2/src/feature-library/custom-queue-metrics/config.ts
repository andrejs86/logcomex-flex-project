import { getFeatureFlags } from '../../utils/configuration';
import CustomQueueMetricsConfig from './types/ServiceConfiguration';

const {
  enabled = false,
  workspaceSid = '',
  authToken = '',
} = (getFeatureFlags()?.features?.custom_queue_metrics as CustomQueueMetricsConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getAuthToken = () => {
  return authToken;
};

export const getWorkspaceSid = () => {
  return workspaceSid;
};
