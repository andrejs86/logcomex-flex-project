import ApiService from '../../../utils/serverless/ApiService';
import { EncodedParams } from '../../../types/serverless';

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
          console.log(response);
          resolve(response);
        })
        .catch((error) => {
          console.error(`Error fetching WA templates\r\n`, error);
          reject(error);
        });
    });
  };

  sendMessage = async (message: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
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
          console.log(response);
          resolve(response);
        })
        .catch((error) => {
          console.error(`Error searching client\r\n`, error);
          reject(error);
        });
    });
  };
}

export default new WhatsappSenderService();
