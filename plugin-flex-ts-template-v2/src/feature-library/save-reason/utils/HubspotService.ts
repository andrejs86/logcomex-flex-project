import axios from 'axios';

import ApiService from '../../../utils/serverless/ApiService';
import { EncodedParams } from '../../../types/serverless';
import * as config from '../config';

class HubspotService extends ApiService {
  SearchClient = async (email: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
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
          (window as any).Rollbar.error(`Error searching client`, { url, email, error });
          reject(error);
        });
    });
  };

  SearchClientByPhone = async (phone: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        clientEmail: phone,
        typeSearch: 'phone',
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
          (window as any).Rollbar.error(`Error searching client`, { url, phone, error });
          reject(error);
        });
    });
  };

  CreateTicket = async (taskAttributes: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
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
          (window as any).Rollbar.error(`Error creating ticket`, { url, taskAttributes, error });
          reject(error);
        });
    });
  };

  GetDeals = async (hs_object_id: any, associatedcompanyid: any, task: any): Promise<any> => {
    console.log('Get Deals', { hs_object_id, associatedcompanyid, task });
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        hs_object_id,
        associatedcompanyid,
        taskSid: task.taskSid,
        reservationSid: task.sid,
        taskAttributes: JSON.stringify(task.attributes),
        source: 'Hubspot Service',
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
          (window as any).Rollbar.error(`Error getting deals`, {
            taskSid: task.taskSid,
            reservationSid: task.sid,
            taskAttributes: task.attributes,
            url,
            hs_object_id,
            associatedcompanyid,
            error,
          });
          reject(error);
        });
    });
  };

  GetNewClientInformation = async (clientEmail: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
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
          (window as any).Rollbar.error(`Error getting new client information`, { url, clientEmail, error });
          reject(error);
        });
    });
  };

  GetTypeAndOutcome = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const encodedParams: EncodedParams = {
        Token: encodeURIComponent(this.manager.store.getState().flex.session.ssoTokenPayload.token),
        TypesAndOutcomesDocumentSid: config.getTypesAndOutcomesDocumentSid(),
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
          (window as any).Rollbar.error(`Error getting type and outcome`, {
            url,
            typesAndOutcomesDocumentSid: config.getTypesAndOutcomesDocumentSid(),
            error,
          });
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
          (window as any).Rollbar.error('Error saving history', {
            url,
            taskAttributes,
            workerAttributes,
            channelType,
            dealId,
            error,
          });
          reject(error);
        });
    });
  };

  private getRecordingsData = async (recordingUrl: string) => {
    if (recordingUrl) {
      const result = await axios.get(`${recordingUrl}.json`).catch((err) => {
        (window as any).Rollbar.error('Could not getRecordingsData', { recordingUrl, err });
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
