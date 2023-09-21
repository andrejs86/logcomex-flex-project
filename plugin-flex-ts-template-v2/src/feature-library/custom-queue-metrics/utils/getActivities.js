import axios from 'axios';
import * as Flex from '@twilio/flex-ui';

import * as config from '../config';

export const getActivities = async () => {
  try {
    const tokenAuthorization = `${Flex.Manager.getInstance().configuration.sso.accountSid}:${config.getAuthToken()}`;
    const buffer = Buffer.from(tokenAuthorization);

    const tokenFormatted = buffer.toString('base64');

    const { data } = await axios.get(
      `https://taskrouter.twilio.com/v1/Workspaces/${config.getWorkspaceSid()}/Activities?PageSize=2000`,
      {
        headers: {
          Authorization: `Basic ${tokenFormatted}`,
        },
      },
    );

    return {
      success: true,
      data: data.activities,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errorMessage: error.message,
    };
  }
};
