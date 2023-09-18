import { PasteCustomCSS } from '@twilio-paste/customization';

export const pasteElementHook = {
  PARTICIPANT_BADGE: {
    paddingTop: 'space0',
    paddingBottom: 'space0',
    paddingLeft: 'space30',
    paddingRight: 'space30',
  },
} as { [key: string]: PasteCustomCSS };
