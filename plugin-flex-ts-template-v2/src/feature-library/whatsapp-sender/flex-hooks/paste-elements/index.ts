import { PasteCustomCSS } from '@twilio-paste/customization';

export const pasteElementHook = {
  WA_FORM: {
    margin: 'space60',
  },
  WA_FORM_CONTROL: {
    margin: 'space30',
  },
} as { [key: string]: PasteCustomCSS };
