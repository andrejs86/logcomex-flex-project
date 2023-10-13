import * as Flex from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader';
import CustomAudioPlayer from '../../custom-components/CustomAudioPlayer/CustomAudioPlayer';

export const componentName = FlexComponent.MainHeader;
export const componentHook = function addSoundControlsToMainHeader(flex: typeof Flex, _manager: Flex.Manager) {
  flex.MainHeader.Content.add(<CustomAudioPlayer key="custom-audio-player" />, {
    sortOrder: 3,
  });
};
