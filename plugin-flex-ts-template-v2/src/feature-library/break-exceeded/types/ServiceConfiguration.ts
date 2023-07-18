export default interface BreakExceededConfig {
  enabled: boolean;
  timeoutActivities: { [activityName: string]: TimeoutActivityConfig };
}

export interface TimeoutActivityConfig {
  time: number;
}
