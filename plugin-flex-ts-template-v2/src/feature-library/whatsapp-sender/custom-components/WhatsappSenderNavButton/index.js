import React from 'react';
import { SideLink, Actions } from '@twilio/flex-ui';

const WhatsappSenderNavButton = ({ activeView }) => {
  function navigate() {
    Actions.invokeAction('NavigateToView', { viewName: 'whatsapp-view' });
  }

  return (
    <SideLink
      showLabel={true}
      icon="Whatsapp"
      iconActive="WhatsappBold"
      isActive={activeView === 'whatsapp-view'}
      onClick={navigate}
    >
      Whatsapp
    </SideLink>
  );
};

export default WhatsappSenderNavButton;
