import * as Flex from '@twilio/flex-ui';

export const changeFlexComponents = async (flex: typeof Flex, manager: Flex.Manager) => {
  const attrs = manager?.workerClient?.attributes as any;
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
      }
    },
    false,
  );

  if (performance.getEntriesByType('navigation')[0].entryType === 'navigate') {
    setTimeout(async () => {
      const message = `Usuário ${attrs.email} realizou o login no Twilio Flex com a atividade - ${manager?.workerClient?.activity?.name}`;
    }, 50);
  }

  flex.Actions.addListener('beforeLogout', async (_payload) => {
    const message = `Usuário ${attrs.email} fez logout no Twilio Flex com a atividade - ${manager?.workerClient?.activity.name}`;
  });
};
