/* eslint-disable consistent-return */
import * as Flex from '@twilio/flex-ui';

import * as config from '../config';

class OutboundHelper {
  StartOutboundCall = async (payload: any, flex: typeof Flex, manager: Flex.Manager): Promise<any> => {
    if (!manager.workerClient) return;

    console.log('Starting Outbound helper', payload);

    const skills =
      (manager.workerClient.attributes as any)?.routing && (manager.workerClient.attributes as any)?.routing.skills;

    if (!skills || (skills && skills.length === 0)) {
      flex.Notifications.showNotification('WithoutSkills');
      return;
    }

    if (payload.queueSid === config.getInternationalQueueSid()) {
      const newPayload = payload;
      newPayload.callerId = config.getInternationalNumber();
      newPayload.queueSid = payload.queueSid;
      console.log('International Outbound Call ready', newPayload);
      return newPayload;
    }

    let skillSid = config.getEveryoneQueueSid();
    let skillName = 'Everyone';

    const tokenAuthorization = `${manager.configuration.sso?.accountSid}:${config.getAuthToken()}`;
    const buffer = Buffer.from(tokenAuthorization);
    const tokenFormatted = buffer.toString('base64');

    async function getSkills(flexWorkspaceSid: string) {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', `Basic ${tokenFormatted}==`);
      const requestOptions: RequestInit = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };

      // Só tenta procurar a queue atual se houver skill setada
      // para o agente
      if (skills && skills.length > 0) {
        const skillSelected = document.getElementById('queue-select-dialpad')
          ? (document.getElementById('queue-select-dialpad') as any)?.value
          : skills[0];

        console.log('Skills Selected', skillSelected);

        const workspace = flexWorkspaceSid;
        const result = await fetch(
          `https://taskrouter.twilio.com/v1/Workspaces/${workspace}/TaskQueues?FriendlyName=${skillSelected}`,
          requestOptions,
        )
          .then(async (response) => {
            return response.json();
          })
          .then((result) => {
            return result;
          })
          .catch((error) => console.log('TR error', error));

        skillSid = result?.task_queues[0] ? result.task_queues[0].sid : skillSid;
        skillName = result?.task_queues[0] ? result.task_queues[0].friendly_name : skillName;
      }
    }

    await getSkills(config.getFlexWorkspaceSid());

    const newPayload = payload;
    const newCallerId = payload.callerId;
    // const newCallerId = this.getOutboundCallerId(payload.callerId, payload.destination);

    newPayload.callerId = newCallerId;
    newPayload.queueSid = skillSid;

    console.log('National Outbound Call ready', newPayload);

    return newPayload;
  };

  // could not use this because local numbers are not verified
  private changeDDDNationalNumber = (customerNumber: any) => {
    let ddd = 44;

    switch (Number(customerNumber.substring(3, 5))) {
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
        ddd = 11;
        break;
      case 21:
      case 22:
      case 24:
        ddd = 21;
        break;
      case 27:
      case 28:
        ddd = 27;
        break;
      case 31:
      case 32:
      case 33:
      case 34:
      case 35:
      case 37:
      case 38:
        ddd = 31;
        break;
      case 41:
      case 44:
      case 42:
      case 43:
      case 45:
      case 46:
        ddd = 41;
        break;
      case 48:
      case 47:
      case 49:
        ddd = 48;
        break;
      case 51:
      case 53:
      case 54:
      case 55:
        ddd = 51;
        break;
      case 62:
      case 61:
      case 63:
      case 64:
      case 65:
      case 66:
      case 67:
      case 68:
      case 69:
        ddd = 62;
        break;
      case 71:
      case 73:
      case 74:
      case 75:
      case 77:
      case 79:
        ddd = 71;
        break;
      case 81:
      case 82:
      case 83:
      case 84:
      case 85:
      case 86:
      case 87:
      case 89:
        ddd = 81;
        break;
      case 91:
      case 92:
      case 93:
      case 94:
      case 95:
      case 96:
      case 97:
      case 98:
      case 99:
        ddd = 91;
        break;
      default:
        ddd = 44;
    }

    return ddd;
  };

  // could not use this because local numbers are not verified
  private getOutboundCallerId = (currentCallerId: any, customerNumber: any) => {
    let callerId: string = currentCallerId;
    if (callerId === config.getNationalNumber()) {
      const ddd = this.changeDDDNationalNumber(customerNumber);
      callerId = `+55${ddd}${callerId.replace('+55', '')}`;
    }
    return callerId;
  };
}

export default new OutboundHelper();
