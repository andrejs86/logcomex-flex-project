import ApiService from '../../../utils/serverless/ApiService';
import { EncodedParams } from '../../../types/serverless';
import * as config from '../config';

class HubspotService extends ApiService {
  searchClient = async (searchValue: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-integration/flex/search-client-modal?value=${searchValue}`;
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

export default new HubspotService();
