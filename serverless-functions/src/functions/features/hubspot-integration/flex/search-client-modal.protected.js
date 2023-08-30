const axios = require('axios');

const OBJECTS_URL = `/crm/v3/objects`;

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const { value } = event;

  const hubspotAxiosInstance = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
      Authorization: `Bearer ${context.HUBSPOT_API_TOKEN}`,
    },
  });

  if (!value) {
    response.setBody({
      success: false,
      message: 'no info provided',
      result: [],
      companies: [],
    });
    return callback(null, response);
  }

  try {
    const filters = [
      {
        value,
        propertyName: 'phone',
        operator: 'CONTAINS_TOKEN',
      },
      {
        value,
        propertyName: 'email',
        operator: 'CONTAINS_TOKEN',
      },
      {
        value,
        propertyName: 'company',
        operator: 'CONTAINS_TOKEN',
      },
      {
        value,
        propertyName: 'firstname',
        operator: 'CONTAINS_TOKEN',
      },
      {
        value,
        propertyName: 'lastname',
        operator: 'CONTAINS_TOKEN',
      },
    ];

    const companyFilters = [
      {
        value,
        propertyName: 'industry',
        operator: 'CONTAINS_TOKEN',
      },
      {
        value,
        propertyName: 'name',
        operator: 'CONTAINS_TOKEN',
      },
      {
        value,
        propertyName: 'phone',
        operator: 'CONTAINS_TOKEN',
      },
    ];

    const companyBodyRequest = {
      filterGroups: companyFilters.map((filter) => {
        return {
          filters: [
            {
              value: filter.value,
              propertyName: filter.propertyName,
              operator: filter.operator,
            },
          ],
        };
      }),
      properties: ['industry', 'name', 'phone', 'state', 'domain', 'city'],
    };

    const bodyRequest = {
      filterGroups: filters.map((filter) => {
        return {
          filters: [
            {
              value: filter.value,
              propertyName: filter.propertyName,
              operator: filter.operator,
            },
          ],
        };
      }),
      properties: ['email', 'firstname', 'hs_object_id', 'lastname', 'phone', 'mobilephone', 'company'],
    };

    const { data: contacts } = await hubspotAxiosInstance.post(`${OBJECTS_URL}/contacts/search`, bodyRequest);

    const { data: companies } = await hubspotAxiosInstance.post(`${OBJECTS_URL}/companies/search`, companyBodyRequest);

    if (contacts.total === 0 && companies.total === 0) {
      response.setBody({
        success: true,
        message: 'no contacts and companies found',
        result: [],
        companies: [],
      });

      return callback(null, response);
    }

    const formattedCompanies = companies.results.map((comp) => {
      return {
        id: comp.id,
        name: comp.properties.name,
        city: comp.properties.city || 'Cidade não informada',
        industry: comp.properties.industry || 'Ramo de atuação não informado',
        phone: comp.properties.phone,
        state: comp.properties.state || 'Estado não informado',
      };
    });

    const formattedInfo = contacts.results.map((cont) => {
      let name = cont.properties.firstname;
      if (cont.properties.lastname) name += ` ${cont.properties.lastname}`;

      const company = cont.properties.company || 'Empresa não informada';
      const email = cont.properties.email || 'E-mail não informado';
      let phone = cont.properties.phone && cont.properties.phone !== '' ? cont.properties.phone : null;

      const mobilePhone =
        cont.properties.mobilephone && cont.properties.mobilephone !== '' ? cont.properties.mobilephone : null;

      if (phone) phone = phone.replace(/\D/gi, '');

      return {
        id: cont.id,
        name,
        company,
        phone,
        mobilePhone,
        email,
      };
    });

    const result = formattedInfo.filter((cc) => cc.phone || cc.mobilePhone);
    const companiesResult = formattedCompanies.filter((cc) => cc.phone);

    response.setBody({ success: true, companies: companiesResult, result });

    return callback(null, response);
  } catch (error) {
    console.log(error);
    response.setBody({ success: false, error, result: [] });
    return callback(null, response);
  }
};
