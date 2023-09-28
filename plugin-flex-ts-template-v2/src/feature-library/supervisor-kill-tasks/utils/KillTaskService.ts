import ApiService from '../../../utils/serverless/ApiService';
import { EncodedParams } from '../../../types/serverless';

class KillTaskService extends ApiService {
  KillTask = async (taskSid: string, conversationSid: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        task_sid: taskSid,
        conversation_sid: conversationSid,
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/supervisor-kill-tasks/kill_tasks`;
      this.fetchJsonWithReject<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams),
      })
        .then((response) => {
          console.log('task killed');
          resolve(response);
        })
        .catch((error) => {
          console.error(`Error killing task\r\n`, error);
          reject(error);
        });
    });
  };
}

export default new KillTaskService();
