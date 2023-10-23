/* eslint-disable @typescript-eslint/no-empty-function */
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import { initFeatures } from './utils/feature-loader';

const PLUGIN_NAME = 'FlexTSTemplatePlugin';

export default class FlexTSTemplatePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   * @param manager { Flex.Manager }
   */
  init(flex: typeof Flex, manager: Flex.Manager) {
    // setup logging (Rollbar)
    this.loadRollbarJS('https://custom-flex-extensions-serverless-7294-dev.twil.io/features/logger/rollbar.js', false);

    initFeatures(flex, manager);
  }

  loadRollbarJS(FILE_URL: any, async = true) {
    const scriptEle = document.createElement('script');
    scriptEle.setAttribute('src', FILE_URL);
    scriptEle.setAttribute('type', 'text/javascript');
    scriptEle.setAttribute('async', async.toString());
    document.body.appendChild(scriptEle);

    // success event
    scriptEle.addEventListener('load', () => {
      console.info(`File loaded - ${FILE_URL}`);
    });

    // error event
    scriptEle.addEventListener('error', (ev) => {
      console.error(`Error on loading file - ${FILE_URL}`, ev);

      if (!(window as any).Rollbar) {
        console.error('COULD NOT INITIALIZE LOGGER!!!');

        const fakeRollbar: any = {};
        fakeRollbar.debug = (..._args: any) => {};
        fakeRollbar.warn = (..._args: any) => {};
        fakeRollbar.info = (..._args: any) => {};
        fakeRollbar.error = (..._args: any) => {};
        fakeRollbar.critical = (..._args: any) => {};

        (window as any).Rollbar = fakeRollbar;
        console.log('Fake Rollbar is set instead.');
      }
    });
  }
}
