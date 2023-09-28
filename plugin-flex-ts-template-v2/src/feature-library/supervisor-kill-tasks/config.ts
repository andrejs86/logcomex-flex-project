import { getFeatureFlags } from '../../utils/configuration';
import SupervisorKillTasksConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.supervisor_kill_tasks as SupervisorKillTasksConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
