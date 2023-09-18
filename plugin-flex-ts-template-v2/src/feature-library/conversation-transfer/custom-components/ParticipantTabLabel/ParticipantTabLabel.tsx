import { TaskContext, Template, templates } from '@twilio/flex-ui';
import { Stack, Badge } from '@twilio-paste/core';

import { StringTemplates } from '../../flex-hooks/strings/ChatTransferStrings';

export const ParticipantTabLabelContainer = () => {
  return (
    <TaskContext.Consumer>
      {(context) => {
        const participantCount = context.conversation?.participants?.size as number;

        if (participantCount && participantCount > 0) {
          return (
            <Stack orientation="horizontal" spacing="space20">
              <Template source={templates[StringTemplates.Participants]} />
              <Badge as="span" variant="info" element="PARTICIPANT_BADGE">
                {participantCount}
              </Badge>
            </Stack>
          );
        }
        return <></>;
      }}
    </TaskContext.Consumer>
  );
};
