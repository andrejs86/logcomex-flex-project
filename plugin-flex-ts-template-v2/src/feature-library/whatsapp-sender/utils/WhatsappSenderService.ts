import ApiService from '../../../utils/serverless/ApiService';
import { EncodedParams } from '../../../types/serverless';
import * as config from '../config';

class WhatsappSenderService extends ApiService {
  getTemplates = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/sender-single-whatsapp-message/flex/get-whatsapp-templates`;
      this.fetchJsonWithReject<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams),
      })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          (window as any).Rollbar.error('Error fetching WA templates', url, error);
          reject(error);
        });
    });
  };

  sendMessage = async (message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        WhatsappNumber: config.getWhatsappNumber(),
        clientNumber: message.clientNumber,
        templateContent: message.templateContent,
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/sender-single-whatsapp-message/flex/send-whatsapp-message`;
      this.fetchJsonWithReject<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams),
      })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          (window as any).Rollbar.error('Error sending whatsapp message', url, message, error);
          reject(error);
        });
    });
  };
}

export default new WhatsappSenderService();
