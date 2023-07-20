import { PasteCustomCSS } from '@twilio-paste/customization';

export const pasteElementHook = {
  AUDIO_RECORDER_BUTTON: {
    backgroundColor: 'transparent',
    borderRadius: 'borderRadiusCircle',
    padding: 'space30',
    ':hover:enabled': {
      backgroundColor: 'colorBackgroundStrong',
    },
  },
} as { [key: string]: PasteCustomCSS };
