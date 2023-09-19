import * as Flex from '@twilio/flex-ui';

export const changeFlexComponents = async (_flex: typeof Flex, _manager: Flex.Manager) => {
  localStorage.openpages = Date.now();
  window.addEventListener(
    'storage',
    (e) => {
      if (e.key === 'openpages') {
        localStorage.page_available = Date.now();
      }
      if (e.key === 'page_available') {
        alert(
          'Já existe uma aba do Twilio Flex em aberto. Para o melhor funcionamento, nunca use duas abas simultaneamente.',
        );
      }
    },
    false,
  );
};
