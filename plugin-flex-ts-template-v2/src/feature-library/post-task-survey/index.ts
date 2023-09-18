import { FeatureDefinition } from '../../types/feature-loader';
import { isVoiceSurveyEnabled, isWhatsappSurveyEnabled } from './config';
// @ts-ignore
import hooks from './flex-hooks/**/*.*';

export const register = (): FeatureDefinition => {
  if (!isWhatsappSurveyEnabled() && !isVoiceSurveyEnabled()) return {};
  return { name: 'post-task-survey', hooks: typeof hooks === 'undefined' ? [] : hooks };
};
