import * as Flex from '@twilio/flex-ui';

import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import SurveyUtil from '../../utils/SurveyUtil';
import * as config from '../../config';

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.HangupCall;

export const actionHook = function sendVoiceSurvey(flex: typeof Flex, _manager: Flex.Manager) {
  if (config.isVoiceSurveyEnabled()) {
    flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, abortFunction) => {
      const participants = payload.task.conference.participants.find(
        (call: any) => call.participantType === 'customer',
      );
      const callSid = participants?.callSid || payload.task.attributes.conference?.participants?.customer;

      if (!callSid) return;

      if (payload.task.conference.liveParticipantCount <= 2) {
        const { taskSid } = payload.task;
        SurveyUtil.sendVoiceSurvey(taskSid, callSid);
        abortFunction(); // do not hangup
      }
    });
  }
};
