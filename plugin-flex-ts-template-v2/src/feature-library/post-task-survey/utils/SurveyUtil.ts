import ApiService from '../../../utils/serverless/ApiService';
import * as config from '../config';

class SurveyUtil extends ApiService {
  sendSurvey = async (taskSid: string, conversationSid: string) => {
    const fetchUrl = `${this.serverlessProtocol}://${this.serverlessDomain}/features/post-task-survey/send-survey`;
    const fetchBody = {
      taskSid,
      conversationSid,
      surveyWorkflowSid: config.getSurveyWorkflowSid(),
      whatsappSurveyContentSid: config.getWhatsappSurveyContentSid(),
      whatsappSurveyMessage: config.getWhatsappSurveyMessage(),
      whatsappNumber: config.getWhatsappNumber(),
      whatsappInboundStudioFlow: config.getWhatsappInboundStudioFlow(),
      Token: this.manager.store.getState().flex.session.ssoTokenPayload.token,
    };
    const fetchOptions = {
      method: 'POST',
      body: new URLSearchParams(fetchBody),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    };
    console.log('Post Task Survey', fetchOptions);
    let data;
    try {
      const response = await fetch(fetchUrl, fetchOptions);
      data = await response.json();
      console.log('Whatsapp Survey Response data:', data);
    } catch (error) {
      console.error(error);
    }

    return data;
  };

  sendVoiceSurvey = async (taskSid: string, callSid: string) => {
    const fetchUrl = `${this.serverlessProtocol}://${this.serverlessDomain}/features/post-task-survey/send-voice-survey`;
    const fetchBody = {
      callSid,
      taskSid,
      surveyWorkflowSid: config.getSurveyWorkflowSid(),
      Token: this.manager.store.getState().flex.session.ssoTokenPayload.token,
    };
    const fetchOptions = {
      method: 'POST',
      body: new URLSearchParams(fetchBody),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    };

    let data;
    try {
      const response = await fetch(fetchUrl, fetchOptions);
      data = await response.json();
      console.log('Voice Survey Response data:', data);
    } catch (error) {
      console.error(error);
    }

    return data;
  };
}

const surveyUtil = new SurveyUtil();
export default surveyUtil;
