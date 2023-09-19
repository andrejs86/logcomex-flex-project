import axios from 'axios';

import ApiService from '../../../utils/serverless/ApiService';
import { EncodedParams } from '../../../types/serverless';
import * as config from '../config';

class HubspotService extends ApiService {
  SearchClient = async (email: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        HubspotApiToken: config.getHubspotApiToken(),
        clientEmail: email,
        typeSearch: 'email',
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-integration/flex/search-client`;
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

  CreateTicket = async (taskAttributes: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        HubspotApiToken: config.getHubspotApiToken(),
        taskAttributes: JSON.stringify(taskAttributes),
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-integration/flex/create-ticket`;
      this.fetchJsonWithReject<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams),
      })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.error(`Error creating ticket\r\n`, error);
          reject(error);
        });
    });
  };

  GetDeals = async (hs_object_id: any, associatedcompanyid: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        HubspotApiToken: config.getHubspotApiToken(),
        hs_object_id,
        associatedcompanyid,
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-integration/flex/get-deals`;
      this.fetchJsonWithReject<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams),
      })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.error(`Error getting deals\r\n`, error);
          reject(error);
        });
    });
  };

  GetNewClientInformation = async (clientEmail: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        HubspotApiToken: config.getHubspotApiToken(),
        typeSearch: 'email',
        clientEmail,
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-integration/flex/search-client`;
      this.fetchJsonWithReject<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams),
      })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.error(`Error getting new client information\r\n`, error);
          reject(error);
        });
    });
  };

  GetTypeAndOutcome = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        HubspotApiToken: config.getHubspotApiToken(),
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-integration/flex/get-call-outcomes-and-types-from-sync`;
      this.fetchJsonWithReject<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams),
      })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.error(`Error saving history\r\n`, error);
          reject(error);
        });
    });
  };

  SaveHistory = async (
    taskAttributes: any,
    taskCreatedDate: any,
    taskUpdatedDate: any,
    workerAttributes: any,
    channelType: any,
    dealId: any,
  ): Promise<any> => {
    taskAttributes.callDuration = await this.getRecordingsData(taskAttributes?.conversations?.segment_link);

    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        HubspotApiToken: config.getHubspotApiToken(),
        CustomObjectConversas: config.getCustomObjectConversas(),
        taskAttributes: JSON.stringify(taskAttributes),
        workerAttributes: JSON.stringify(workerAttributes),
        taskCreatedDate,
        taskUpdatedDate,
        channelType,
        dealId,
      };

      const url = `${this.serverlessProtocol}://${this.serverlessDomain}/features/hubspot-integration/flex/save-history`;
      this.fetchJsonWithReject<any>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: this.buildBody(encodedParams),
      })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.error(`Error saving history\r\n`, error);
          reject(error);
        });
    });
  };

  private getRecordingsData = async (recordingUrl: string) => {
    if (recordingUrl) {
      const result = await axios.get(`${recordingUrl}.json`).catch((err) => {
        return {
          success: false,
          message: err.message,
        };
      });
      return (result as any).data.duration;
    }
    return false;
  };
}

export default new HubspotService();
