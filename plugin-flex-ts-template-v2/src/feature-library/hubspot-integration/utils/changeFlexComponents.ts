import * as Flex from '@twilio/flex-ui';

import { getDatadogLogsBaseURL } from '../config';

async function sendLogs(obj: any) {
  await fetch(`${getDatadogLogsBaseURL()}/integrations/datadog_logs`, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams(obj),
  });
}

export const changeFlexComponents = async (flex: typeof Flex, manager: Flex.Manager) => {
  const attrs = manager?.workerClient?.attributes as any;
  const data = {
    agentEmail: attrs.email,
    agentName: attrs.full_name,
    hostedPage: window.location.ancestorOrigins[0] ? window.location.ancestorOrigins[0] : window.location.href,
  };

  localStorage.openpages = Date.now();
  window.addEventListener(
    'storage',
    (e) => {
      if (e.key === 'openpages') {
        localStorage.page_available = Date.now();
      }
      if (e.key === 'page_available') {
        alert(
          'Já existe uma aba do Twilio Flex em aberto, para o melhor funcionamento, nunca use duas abas simultaneamente',
        );
        sendLogs({
          ddtags: `env:production,athanCustomer:logcomex,metric:USER_SESSION_STATE`,
          message: `Usuário ${attrs.email} acessou mais de uma aba do Twilio Flex simultaneamente`,
          level: 'log',
          data: JSON.stringify(data),
        });
      }
    },
    false,
  );

  window.addEventListener('offline', () => {
    sendLogs({
      ddtags: `env:production,athanCustomer:logcomex,metric:USER_SESSION_STATE`,
      message: `Usuário ${attrs.email} perdeu a conexão com o Twilio Flex - ${manager?.workerClient?.activity.name}`,
      level: 'log',
      data: JSON.stringify(data),
    });
  });

  window.addEventListener('beforeunload', () => {
    sendLogs({
      ddtags: `env:production,athanCustomer:logcomex,metric:USER_SESSION_STATE`,
      message: `Usuário ${attrs.email} fechou ou recarregou o Twilio Flex sem realizar o logout com a atividade - ${manager?.workerClient?.activity?.name}`,
      level: 'log',
      data: JSON.stringify(data),
    });
  });

  if (performance.getEntriesByType('navigation')[0].entryType === 'navigate') {
    setTimeout(async () => {
      const message = `Usuário ${attrs.email} realizou o login no Twilio Flex com a atividade - ${manager?.workerClient?.activity?.name}`;

      await sendLogs({
        ddtags: `env:production,athanCustomer:logcomex,metric:USER_SESSION_STATE`,
        message,
        level: 'log',
        data: JSON.stringify(data),
      });
    }, 50);
  }

  flex.Actions.addListener('beforeLogout', async (_payload) => {
    const message = `Usuário ${attrs.email} fez logout no Twilio Flex com a atividade - ${manager?.workerClient?.activity.name}`;

    await sendLogs({
      ddtags: `env:production,athanCustomer:logcomex,metric:USER_SESSION_STATE`,
      message,
      level: 'log',
      data: JSON.stringify(data),
    });
  });
};
