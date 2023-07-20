import * as Flex from '@twilio/flex-ui';
import React from 'react';

import AudioRecorder from '../../custom-components/AudioRecorder';
import SendMediaService from '../../utils/SendMediaService';
import { FlexComponent } from '../../../../types/feature-loader';

export const componentName = FlexComponent.MessageInputActions;
export const componentHook = function addToMessageInput(flex: typeof Flex, manager: Flex.Manager) {
  const sendMediaService = new SendMediaService(manager);

  flex.MessageInputActions.Content.add(
    <AudioRecorder key="record-audio-component" sendMediaService={sendMediaService} />,
    { sortOrder: -1, align: 'end' },
  );
};
