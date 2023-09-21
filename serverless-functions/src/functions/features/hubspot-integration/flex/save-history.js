const axios = require('axios');
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const OBJECTS_URL = `/crm/v3/objects`;
const ASSOCIATIONS_URL = `/crm/v3/associations`;
let CONVERSAS_URL = '';
let ASSOCIATIONS_URL_CONVERSAS = '';

// get message history of conversation between client, bot and Agent

async function getMessages(conversationSid, createdTaskDate) {
  const messages = await client.chat.v2
    .services(process.env.TWILIO_FLEX_CHAT_SERVICE_SID)
    .channels(conversationSid)
    .messages.list();

  // filtering just messages that be sent after the created date of the task
  return messages.filter((message) => {
    const messageDateCreated = new Date(message.dateCreated).getTime();
    return messageDateCreated >= createdTaskDate - 600000;
  });
}

async function getHistoryMessageAndFormat(conversationSid, messagesFiltered, taskAttributes) {
  let noteMessage = `<b>Nova conversa Whatsapp</b><br><i>(ID da conversa: ${conversationSid}</i><br><br>`;

  const firedMessage = taskAttributes.clientInformation?.ultima_mensagem_disparada;

  if (
    taskAttributes.clientInformation?.atendimento_ativo_por &&
    taskAttributes.clientInformation?.atendimento_ativo_por !== ''
  ) {
    noteMessage += `<b>Mensagem Disparada</b><br>${firedMessage}<br><br>`;
  }

  messagesFiltered.forEach((message) => {
    const from = message.from.includes('whatsapp')
      ? '<b>Cliente</b>'
      : message.from.startsWith('CH')
      ? '<b>Bot</b>'
      : `<b>Atendente</b> ${message.from}`;

    let body = message.body ? message.body.split('\n').join('<br>') : '';

    if (message.attributes) {
      const attributesJSON = JSON.parse(message.attributes);

      if (attributesJSON.media) {
        body += `<a target="_blank" href="${attributesJSON.media}">Arquivo anexado</a>`;
      }
    }

    const hour = `<i>${new Date(message.dateCreated).toLocaleString(undefined, {
      hour12: true,
      timeStyle: 'medium',
      dateStyle: 'short',
    })}`;

    noteMessage += `${from}<br>${body}<br>${hour}<br><br>`;
  });

  noteMessage += '<b>Fim da Conversa</b>';

  return noteMessage;
}

// create conversa(custom object) and note
async function createConversaAndNote(
  hubspotId,
  createdTaskDate,
  updatedTaskDate,
  taskAttributes,
  workerInformation,
  channelType,
  noteMessage,
  hubspotAxiosInstance,
) {
  try {
    const clientFullName = `${taskAttributes?.clientInformation?.firstname} ${
      taskAttributes?.clientInformation?.lastname || ''
    }`;

    const title = `${clientFullName} (${hubspotId || 'Sem Hubspot ID'})`;

    // creating a data on our custom object

    const conversasPost = {
      properties: {
        historico_de_atendimento: title,
        agent_name: workerInformation.workerName,
        agent: workerInformation.workerEmail,
        conversa_aberta_date: createdTaskDate,
        conversa_fechada_date: updatedTaskDate,
        canal: channelType,
      },
    };

    const conversaObject = await hubspotAxiosInstance.post(CONVERSAS_URL, conversasPost);

    // creating a note for store the messages
    const noteObject = await hubspotAxiosInstance.post(`/engagements/v1/engagements`, {
      engagement: { active: true, type: 'NOTE' },
      metadata: { body: noteMessage },
    });

    return {
      success: true,
      conversaId: conversaObject.data.id,
      noteId: noteObject.data.engagement.id,
    };
  } catch (error) {
    console.log(error.message);
    return { success: false, message: error.message };
  }
}

// create conversa(custom object) and note
async function createConversaAndCall(
  hubspotId,
  createdTaskDate,
  updatedTaskDate,
  taskAttributes,
  workerInformation,
  channelType,
  hubspotAxiosInstance,
) {
  try {
    const clientFullName = `${taskAttributes?.clientInformation?.firstname} ${
      taskAttributes?.clientInformation?.lastname || ''
    }`;

    const title = `${clientFullName} (${hubspotId || 'Sem Hubspot ID'})`;
    const agentHS = await hubspotAxiosInstance.get(`/crm/v3/owners?email=${workerInformation.workerEmail}`);
    const agentId = agentHS?.data?.results[0]?.id;

    // creating a data on our custom object
    const conversaObject = await hubspotAxiosInstance.post(CONVERSAS_URL, {
      properties: {
        historico_de_atendimento: title,
        agent_name: workerInformation.workerName,
        agent: workerInformation.workerEmail,
        conversa_aberta_date: createdTaskDate,
        conversa_fechada_date: updatedTaskDate,
        canal: channelType,
      },
    });

    const callDuration = taskAttributes.callDuration;
    const taskAge = callDuration ? Number(callDuration) * 1000 : updatedTaskDate - createdTaskDate;
    // creating a note for store the messages
    const messageFailToGetTaskDetails = 'Sem descrição de atendimento informada ou não foi possível salvar os dados';

    const callObject = await hubspotAxiosInstance.post(`${OBJECTS_URL}/calls`, {
      properties: {
        hs_call_disposition: taskAttributes.call_outcome,
        hs_activity_type: taskAttributes.call_type,
        hs_timestamp: new Date().getTime(),
        hs_call_title: `Chamada com ${
          taskAttributes.direction === 'outbound' ? taskAttributes.name : taskAttributes.customers.name
        }`,
        hs_call_body: taskAttributes.taskDetails ? taskAttributes.taskDetails : messageFailToGetTaskDetails,
        hs_call_duration: taskAge,
        hubspot_owner_id: agentId ? agentId : '',
        hs_call_from_number: taskAttributes.direction === 'outbound' ? taskAttributes.from : taskAttributes.to,
        hs_call_to_number: taskAttributes.direction === 'outbound' ? taskAttributes.outbound_to : taskAttributes.from,
        hs_call_recording_url: taskAttributes.conversations && taskAttributes.conversations?.segment_link,
        hs_call_status: 'COMPLETED',
        hs_call_direction: taskAttributes.direction.toUpperCase(),
      },
    });

    return {
      success: true,
      conversaId: conversaObject.data.id,
      callId: callObject.data.id,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
}

// create all relation on call between conversa and contact
async function createCallRelations(conversaId, callId, hubspotId, ticketId, companyId, hubspotAxiosInstance, dealId) {
  try {
    await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL_CONVERSAS}/call/batch/create`, {
      inputs: [
        {
          from: { id: conversaId },
          to: { id: callId },
          type: 'conversa_to_call',
        },
      ],
    });

    if (ticketId) {
      // making a relation between ticket and call
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/ticket/call/batch/create`, {
        inputs: [
          {
            from: { id: ticketId },
            to: { id: callId },
            type: 'ticket_to_call',
          },
        ],
      });
    }

    if (hubspotId) {
      // making a relation between contact and call
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/contact/call/batch/create`, {
        inputs: [
          {
            from: { id: hubspotId },
            to: { id: callId },
            type: 'contact_to_call',
          },
        ],
      });

      // making a relation between conversa(out custom object) and contact
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL_CONVERSAS}/contact/batch/create`, {
        inputs: [
          {
            from: { id: conversaId },
            to: { id: hubspotId },
            type: 'conversa_to_contact',
          },
        ],
      });

      const { data } = await hubspotAxiosInstance.get(
        `${OBJECTS_URL}/contacts/${hubspotId}?associations=company&associations=deal`,
      );

      if (dealId) {
        await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/deal/call/batch/create`, {
          inputs: [
            {
              from: { id: dealId },
              to: { id: callId },
              type: 'deal_to_call',
            },
          ],
        });
      }

      if (data.associations && data.associations.companies && data.associations.companies.results.length > 0) {
        await Promise.all(
          data.associations.companies.results.map(async (result) => {
            // making a relation between company and note
            await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/company/call/batch/create`, {
              inputs: [
                {
                  from: { id: result.id },
                  to: { id: callId },
                  type: 'company_to_call',
                },
              ],
            });

            // making a relation between conversa(out custom object) and company
            await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL_CONVERSAS}/company/batch/create`, {
              inputs: [
                {
                  from: { id: conversaId },
                  to: { id: result.id },
                  type: 'conversa_to_company',
                },
              ],
            });
          }),
        );
      }
    }

    if (companyId) {
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/company/call/batch/create`, {
        inputs: [
          {
            from: { id: companyId },
            to: { id: callId },
            type: 'company_to_call',
          },
        ],
      });

      // making a relation between conversa(out custom object) and company
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL_CONVERSAS}/company/batch/create`, {
        inputs: [
          {
            from: { id: conversaId },
            to: { id: companyId },
            type: 'conversa_to_company',
          },
        ],
      });
    }

    return { success: true };
  } catch (err) {
    console.log(err.message);
    return { success: false, message: err.message };
  }
}

// create all relation between conversa, contact and note
async function createRelations(conversaId, noteId, hubspotId, ticketId, companyId, hubspotAxiosInstance) {
  try {
    // making a relation between conversa(our custom object) and the note
    await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL_CONVERSAS}/note/batch/create`, {
      inputs: [
        {
          from: { id: conversaId },
          to: { id: noteId },
          type: 'conversa_to_note',
        },
      ],
    });

    if (ticketId) {
      // making a relation between ticket and note
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/ticket/note/batch/create`, {
        inputs: [
          {
            from: { id: ticketId },
            to: { id: noteId },
            type: 'ticket_to_note',
          },
        ],
      });
    }

    if (hubspotId) {
      // making a relation between contact and note
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/contact/note/batch/create`, {
        inputs: [
          {
            from: { id: hubspotId },
            to: { id: noteId },
            type: 'contact_to_note',
          },
        ],
      });

      // making a relation between conversa(out custom object) and contact
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL_CONVERSAS}/contact/batch/create`, {
        inputs: [
          {
            from: { id: conversaId },
            to: { id: hubspotId },
            type: 'conversa_to_contact',
          },
        ],
      });

      const { data } = await hubspotAxiosInstance.get(
        `${OBJECTS_URL}/contacts/${hubspotId}?associations=company&associations=deal`,
      );

      if (data.associations && data.associations.companies && data.associations.companies.results.length > 0) {
        await Promise.all(
          data.associations.companies.results.map(async (result) => {
            // making a relation between company and note
            await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/company/note/batch/create`, {
              inputs: [
                {
                  from: { id: result.id },
                  to: { id: noteId },
                  type: 'company_to_note',
                },
              ],
            });

            // making a relation between conversa(out custom object) and company
            await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL_CONVERSAS}/company/batch/create`, {
              inputs: [
                {
                  from: { id: conversaId },
                  to: { id: result.id },
                  type: 'conversa_to_company',
                },
              ],
            });
          }),
        );
      }

      if (data.associations && data.associations.deals && data.associations.deals.results.length > 0) {
        await Promise.all(
          data.associations.deals.results.map(async (result) => {
            // making a relation between deal and note
            await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/deal/note/batch/create`, {
              inputs: [
                {
                  from: { id: result.id },
                  to: { id: noteId },
                  type: 'deal_to_note',
                },
              ],
            });

            // making a relation between conversa(out custom object) and deal
            await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL_CONVERSAS}/deal/batch/create`, {
              inputs: [
                {
                  from: { id: conversaId },
                  to: { id: result.id },
                  type: 'conversa_to_deal',
                },
              ],
            });
          }),
        );
      }
    }

    if (companyId) {
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL}/company/note/batch/create`, {
        inputs: [
          {
            from: { id: companyId },
            to: { id: noteId },
            type: 'company_to_note',
          },
        ],
      });

      // making a relation between conversa(out custom object) and company
      await hubspotAxiosInstance.post(`${ASSOCIATIONS_URL_CONVERSAS}/company/batch/create`, {
        inputs: [
          {
            from: { id: conversaId },
            to: { id: companyId },
            type: 'conversa_to_company',
          },
        ],
      });
    }

    return { success: true };
  } catch (err) {
    console.log(err.message);
    return { success: false, message: err.message };
  }
}

async function searchCompany(value, hubspotAxiosInstance) {
  try {
    const newValue = value.replace(/[A-Za-z\:\+]/g, '');
    const withNine = `${newValue.substring(0, 4)}9${newValue.substring(4)}`;
    let withoutNine = newValue.split('');
    withoutNine.splice(4, 1);
    withoutNine = withoutNine.join('');

    const ddi = newValue.substring(0, 2);
    const ddd = newValue.substring(2, 4);
    const valueWithoutDDD = newValue.substring(4, newValue.length + 1);

    const valueFormatted = `+${ddi} ${ddd} ${valueWithoutDDD}`;

    const filters = [
      {
        value: withoutNine,
        propertyName: 'phone',
        operator: 'CONTAINS_TOKEN',
      },
      {
        value: withNine,
        propertyName: 'phone',
        operator: 'CONTAINS_TOKEN',
      },
      {
        value: newValue,
        propertyName: 'phone',
        operator: 'CONTAINS_TOKEN',
      },
      {
        value: valueFormatted,
        propertyName: 'phone',
        operator: 'CONTAINS_TOKEN',
      },
    ];

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
      properties: ['hs_object_id'],
    };

    const { data: companies } = await hubspotAxiosInstance.post(`${OBJECTS_URL}/companies/search`, bodyRequest);

    return companies.results.length > 0 ? companies.results[0].id : false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

exports.handler = async (context, event, callback) => {
  const response = new Twilio.Response();

  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  const { taskCreatedDate, taskUpdatedDate, channelType, dealId, CustomObjectConversas } = event;
  const taskAttributes = JSON.parse(event.taskAttributes);
  const workerAttributes = JSON.parse(event.workerAttributes);

  CONVERSAS_URL = `${OBJECTS_URL}/${CustomObjectConversas}`;
  ASSOCIATIONS_URL_CONVERSAS = `${ASSOCIATIONS_URL}/${CustomObjectConversas}`;

  console.log('Conversas URL', CONVERSAS_URL);
  console.log('Associations URL', ASSOCIATIONS_URL_CONVERSAS);

  const hubspotAxiosInstance = axios.create({
    baseURL: 'https://api.hubapi.com',
    headers: {
      Authorization: `Bearer ${context.HUBSPOT_API_KEY}`,
    },
  });

  if (!taskAttributes) {
    response.setBody({
      success: false,
      message: 'Task attributes undefined',
    });
    return callback(null, response);
  }

  const createdTaskDate = new Date(taskCreatedDate).getTime();
  const updatedTaskDate = new Date(taskUpdatedDate).getTime();
  const hubspotId = (taskAttributes.clientInformation && Number(taskAttributes.clientInformation.hs_object_id)) || null;
  const companyId = await searchCompany(
    taskAttributes.direction === 'outbound' ? taskAttributes.outbound_to : taskAttributes.from,
    hubspotAxiosInstance,
  );

  try {
    if (channelType === 'voice') {
      console.log('Voice');
      if (!taskAttributes.conversations && !taskAttributes.conversations?.segment_link) {
        response.setBody({
          success: false,
          errorMessage: 'Link da gravação indisponível',
        });
        console.log(response.body.errorMessage);
        return callback(null, response);
      }

      const conversaAndCallData = await createConversaAndCall(
        hubspotId,
        createdTaskDate,
        updatedTaskDate,
        taskAttributes,
        workerAttributes,
        taskAttributes.channelType,
        hubspotAxiosInstance,
      );

      if (!conversaAndCallData.success) {
        console.log(conversaAndCallData.message);
        return callback(conversaAndCallData.message);
      }

      console.log('CALL ID - ', conversaAndCallData.callId);
      console.log('CONVERSA ID - ', conversaAndCallData.conversaId);

      // Create relations
      const relationData = await createCallRelations(
        conversaAndCallData.conversaId,
        conversaAndCallData.callId,
        hubspotId,
        taskAttributes.ticketId,
        companyId,
        hubspotAxiosInstance,
        dealId,
      );

      if (!relationData.success) {
        console.log(relationData.message);
        return callback(relationData.message);
      }

      console.log(`Historico salvo no hubspot com sucesso! - ${channelType}`);
      response.setBody({
        success: true,
      });
      return callback(null, response);
    }

    console.log('Chat');
    const messages = await getMessages(taskAttributes.conversationSid, createdTaskDate);
    console.log('Messages retrieved');

    // get all messages of conversation and formatting it
    const noteMessage = await getHistoryMessageAndFormat(taskAttributes.conversationSid, messages, taskAttributes);
    console.log('Messages formatted');

    // create Conversa(out custom object) and Note
    const conversaAndNoteData = await createConversaAndNote(
      hubspotId,
      createdTaskDate,
      updatedTaskDate,
      taskAttributes,
      workerAttributes,
      taskAttributes.channelType,
      noteMessage,
      hubspotAxiosInstance,
    );

    if (!conversaAndNoteData.success) {
      console.log(conversaAndNoteData.message);
      return callback(conversaAndNoteData.message);
    }
    console.log('Note created');

    // Create relations
    const relationData = await createRelations(
      conversaAndNoteData.conversaId,
      conversaAndNoteData.noteId,
      hubspotId,
      taskAttributes.ticketId,
      companyId,
      hubspotAxiosInstance,
    );

    if (!relationData.success) {
      console.log(relationData.message);
      return callback(relationData.message);
    }
    console.log('Relations created');

    console.log('Historico salvo no hubspot com sucesso!');
    response.setBody({
      success: true,
    });
    return callback(null, response);
  } catch (err) {
    console.log(err);
    return callback(null, err);
  }
};
