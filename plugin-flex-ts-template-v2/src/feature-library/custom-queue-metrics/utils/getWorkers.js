import axios from 'axios';
import * as Flex from '@twilio/flex-ui';

import * as config from '../config';

export const getWorkers = async (skill) => {
  try {
    const tokenAuthorization = `${Flex.Manager.getInstance().configuration.sso.accountSid}:${config.getAuthToken()}`;
    const buffer = Buffer.from(tokenAuthorization);

    const tokenFormatted = buffer.toString('base64');

    let params = `?TargetWorkersExpression=routing.skills HAS "${skill}"&PageSize=2000`;

    if (skill === 'Everyone') {
      params = '';
    }

    const { data } = await axios.get(
      `https://taskrouter.twilio.com/v1/Workspaces/${config.getWorkspaceSid()}/Workers${params}`,
      {
        headers: {
          Authorization: `Basic ${tokenFormatted}`,
        },
      },
    );

    return {
      success: true,
      data: data.workers,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errorMessage: error.message,
    };
  }
};
