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
      Authorization: `Bearer ${context.HUBSPOT_API_KEY}`,
    },
  });

  const { associatedcompanyid, hs_object_id } = event;

  if (!associatedcompanyid) {
    response.setBody({
      success: false,
      message: `CompanyId id is undefined`,
    });
    return callback(null, response);
  }

  try {
    const companies = [];
    let isCompanyActive = false;

    const { data: ContactCompanies } = await hubspotAxiosInstance.get(
      `/crm/v4/objects/contacts/${hs_object_id}/associations/companies`,
    );

    for (const company of ContactCompanies.results) {
      const { data: contactCompany } = await hubspotAxiosInstance.get(
        `/crm/v3/objects/companies/${Number(company.toObjectId)}`,
        {
          params: {
            properties: 'status_da_empresa, name, phone',
            archived: 'false',
          },
        },
      );

      companies.push({
        ...contactCompany,
        properties: {
          ...contactCompany.properties,
        },
      });

      const status = contactCompany.properties.status_da_empresa;

      if (status.includes('Cliente Ativo') || status.includes('Faturamento Dividido')) {
        isCompanyActive = true;
      }
    }

    response.setBody({
      success: true,
      companies,
      isCompanyActive,
    });

    return callback(null, response);
  } catch (error) {
    console.log(error);
    response.setBody({ success: false, error });
    return callback(response, null);
  }
};
