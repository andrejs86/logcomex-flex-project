const axios = require('axios');

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const hubspotAxiosInstance = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
      Authorization: `Bearer ${event.HubspotApiToken}`,
    },
  });

  const { hs_object_id, associatedcompanyid } = event;

  if (!hs_object_id) {
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
          properties: 'dealname, closedate, createdate, dealstage, hubspot_owner_id, hubspot_object_id',
          archived: 'false',
        },
      });

      const { data: owner } = await hubspotAxiosInstance.get(
        `/crm/v3/owners/${contactDeal.properties.hubspot_owner_id}`,
        {
          params: {
            properties: 'hubspot_owner_id, email,lastname,firstname',
            archived: 'false',
          },
        },
      );

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
            properties: 'dealname, closedate, createdate, dealstage, hubspot_owner_id, hubspot_object_id',
            archived: 'false',
          },
        });

        const { data: owner } = await hubspotAxiosInstance.get(
          `/crm/v3/owners/${companyDeal.properties.hubspot_owner_id}`,
          {
            params: {
              properties: 'hubspot_owner_id, email,lastname,firstname',
              archived: 'false',
            },
          },
        );

        deals.companyDeals.push({
          ...companyDeal,
          properties: {
            ...companyDeal.properties,
            dealOwner: owner?.email,
          },
        });
      }
    }

    response.setBody({
      success: true,
      deals,
    });

    return callback(null, response);
  } catch (error) {
    console.log(error);
    response.setBody({ success: false, error });
    return callback(response, null);
  }
};
