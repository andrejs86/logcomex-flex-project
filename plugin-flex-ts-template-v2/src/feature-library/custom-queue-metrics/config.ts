import { getFeatureFlags } from '../../utils/configuration';
import CustomQueueMetricsConfig from './types/ServiceConfiguration';

const { enabled = false, workspaceSid = '' } =
  (getFeatureFlags()?.features?.custom_queue_metrics as CustomQueueMetricsConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const getAccountSid = () => {
  return process.env.TWILIO_ACCOUNT_SID;
};

export const getAuthToken = () => {
  return process.env.TWILIO_AUTH_TOKEN;
};

export const getWorkspaceSid = () => {
  return workspaceSid;
};
