import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import SurveyUtil from '../../utils/SurveyUtil';
import * as config from '../../config';

export const actionEvent = FlexActionEvent.after;
export const actionName = FlexAction.CompleteTask;

export const actionHook = function sendWhatsappSurvey(flex: typeof Flex, _manager: Flex.Manager) {
  if (config.isWhatsappSurveyEnabled()) {
    flex.Actions.addListener(`${actionEvent}${actionName}`, ({ task }) => {
      const { taskSid, channelType, attributes } = task;
      const conversationSid = Flex.TaskHelper.getTaskConversationSid(task);

      const checkSupportSkill =
        attributes.skillsNeeded?.length > 0 &&
        attributes.skillsNeeded.find((skill: string) => skill.includes('support'));

      if (channelType === 'whatsapp' && !checkSupportSkill) {
        console.log('Sending Post Task Survey (Whatsapp)...', taskSid, conversationSid);
        SurveyUtil.sendSurvey(taskSid, conversationSid);
      }
    });
  }
};
