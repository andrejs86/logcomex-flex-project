import ApiService from '../../../utils/serverless/ApiService';
import { EncodedParams } from '../../../types/serverless';

class HubspotService extends ApiService {
  UpdateInfo = async (data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        hubspot_id: data.hubspot_id,
        newNumber: data.newNumber,
        messagePropertyValue: data.messagePropertyValue,
        search: data.search,
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-integration/flex/update-info`;
      this.fetchJsonWithReject<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams),
      })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.error(`Error searching client\r\n`, error);
          reject(error);
        });
    });
  };
}

export default new HubspotService();
