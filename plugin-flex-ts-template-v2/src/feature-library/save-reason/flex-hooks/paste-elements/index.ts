import { PasteCustomCSS } from '@twilio-paste/customization';

export const pasteElementHook = {
  TASK_DETAILS_BUTTON: {
    alignSelf: 'center',
    margin: 'space30',
    paddingTop: 'space20',
    paddingBottom: 'space20',
    paddingLeft: 'space30',
    paddingRight: 'space30',
  },
} as { [key: string]: PasteCustomCSS };
