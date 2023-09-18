import { getFeatureFlags } from '../../utils/configuration';
import PostTaskSurveyConfig from './types/ServiceConfiguration';

const {
  voiceSurveyEnabled = false,
  whatsappSurveyEnabled = false,
  surveyWorkflowSid = '',
  whatsappSurveyContentSid = '',
  whatsappSurveyMessage = '',
  whatsappNumber = '',
  whatsappInboundStudioFlow = '',
} = (getFeatureFlags()?.features?.post_task_survey as PostTaskSurveyConfig) || {};

export const isVoiceSurveyEnabled = () => {
  return voiceSurveyEnabled;
};

export const isWhatsappSurveyEnabled = () => {
  return whatsappSurveyEnabled;
};

export const getSurveyWorkflowSid = () => {
  return surveyWorkflowSid;
};

export const getWhatsappSurveyContentSid = () => {
  return whatsappSurveyContentSid;
};

export const getWhatsappSurveyMessage = () => {
  return whatsappSurveyMessage;
};

export const getWhatsappNumber = () => {
  if (!whatsappNumber.startsWith('whatsapp:')) return `whatsapp:${whatsappNumber}`;

  return whatsappNumber;
};

export const getWhatsappInboundStudioFlow = () => {
  return whatsappInboundStudioFlow;
};
