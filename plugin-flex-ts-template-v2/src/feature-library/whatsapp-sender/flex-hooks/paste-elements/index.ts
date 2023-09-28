import { PasteCustomCSS } from '@twilio-paste/customization';

export const pasteElementHook = {
  WA_FORM: {
    margin: 'space60',
    minWidth: '750px',
    width: '100%',
  },
  WA_FORM_CONTROL: {
    margin: 'space30',
  },
  WA_VIEW: {
    overflowX: 'hidden',
    overflowY: 'auto',
    width: '-webkit-fill-available',
  },
} as { [key: string]: PasteCustomCSS };
