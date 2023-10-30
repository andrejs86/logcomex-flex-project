const axios = require('axios');

const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

const tryParseJSON = (obj) => {
  try {
    return JSON.parse(obj);
  } catch {
    return obj;
  }
};

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const hubspotAxiosInstance = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
      Authorization: `Bearer ${context.HUBSPOT_API_KEY}`,
    },
  });

  const { hs_object_id, associatedcompanyid } = event;
  const { source, task } = event;

  if (!hs_object_id) {
    logger.debug('Could not get deals (unknown client)', {
      hs_object_id,
      associatedcompanyid,
      source,
      task: tryParseJSON(task),
    });
    response.setBody({
      success: false,
      message: `Contact id is undefined`,
    });
    return callback(null, response);
  }

  try {
    const deals = {
      contactDeals: [],
      companyDeals: [],
    };

    const { data: ContactDeals } = await hubspotAxiosInstance.get(
      `/crm/v4/objects/contacts/${hs_object_id}/associations/deals`,
    );

    for (const deal of ContactDeals.results) {
      const { data: contactDeal } = await hubspotAxiosInstance.get(`/crm/v3/objects/deals/${deal.toObjectId}`, {
        params: {
          properties: 'dealname,closedate,createdate,dealstage,hubspot_owner_id,hubspot_object_id',
          archived: 'false',
        },
      });

      let owner = { email: '' };
      try {
        const result = await hubspotAxiosInstance.get(`/crm/v3/owners/${contactDeal.properties.hubspot_owner_id}`, {
          params: {
            properties: 'hubspot_owner_id,email,lastname,firstname',
            archived: 'false',
          },
        });

        owner = result.data;
      } catch (err) {
        logger.warn('Warning getting contact deals: owner not found!', { contactDeal, event, err });
      }

      deals.contactDeals.push({
        ...contactDeal,
        properties: {
          ...contactDeal.properties,
          dealOwner: owner?.email,
        },
      });
    }

    if (associatedcompanyid) {
      const { data: CompanyDeals } = await hubspotAxiosInstance.get(
        `/crm/v4/objects/company/${associatedcompanyid}/associations/deals`,
      );

      for (const deal of CompanyDeals.results) {
        const { data: companyDeal } = await hubspotAxiosInstance.get(`/crm/v3/objects/deals/${deal.toObjectId}`, {
          params: {
            properties: 'dealname,closedate,createdate,dealstage,hubspot_owner_id,hubspot_object_id',
            archived: 'false',
          },
        });

        let owner = { email: '' };
        try {
          const result = await hubspotAxiosInstance.get(`/crm/v3/owners/${companyDeal.properties.hubspot_owner_id}`, {
            params: {
              properties: 'hubspot_owner_id,email,lastname,firstname',
              archived: 'false',
            },
          });

          owner = result.data;
        } catch (err) {
          logger.warn('Warning getting company deals: owner not found!', { companyDeal, event, err });
        }

        deals.companyDeals.push({
          ...companyDeal,
          properties: {
            ...companyDeal.properties,
            dealOwner: owner?.email,
          },
        });
      }
    }

    logger.info('Deals successfully retrieved', { deals, event });
    response.setBody({
      success: true,
      deals,
    });

    return callback(null, response);
  } catch (error) {
    logger.error('Could not retrieve deals', { event, error });
    response.setBody({ success: false, error });
    return callback(response, null);
  }
};
