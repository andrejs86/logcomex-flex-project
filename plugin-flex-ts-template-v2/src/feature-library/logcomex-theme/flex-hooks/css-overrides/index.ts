import * as Flex from '@twilio/flex-ui';

import * as Config from '../../config';

export const cssOverrideHook = (flex: typeof Flex, manager: Flex.Manager) => {
  flex.MainHeader.defaultProps.logoUrl = Config.getLogoUrl();

  const lightTheme = true;
  const cSolitude = '#eaebf0';
  const cBlue = '#1d0336';
  const configuration = {
    theme: {
      isLight: lightTheme,
    },
  };
  // Finally, we pass the configuration to the Flex manager to make the changes go live
  manager.updateConfig(configuration);

  const hubspotInstanceId = Config.getHubspotInstanceId();
  const crmDefaultUrl = `https://app.hubspot.com/contacts/${hubspotInstanceId}/objects/0-1/views/all/list`;

  if (window.self !== window.top) {
    flex.AgentDesktopView.defaultProps.showPanel2 = false;
  }
  // the uriCallback will populate the CRM Panel when arriving at a new task, the code below will check if the task has the properties of condition, if yes we'll search the contact in the Hubspot if no have we list the default CRM page that is defined above.
  flex.CRMContainer.defaultProps.uriCallback = (task) => {
    // this information about the task is defined in the studio, that is when the user is found in Hubspot we send the client to Flex with all the information about it, so only found customers will be searched in the CRM Panel
    if (
      task &&
      task.attributes &&
      task.attributes.clientInformation &&
      task.attributes.clientInformation.hs_object_id
    ) {
      if (task.attributes.ticketUrl) return task.attributes.ticketUrl;

      return `https://app.hubspot.com/contacts/${hubspotInstanceId}/contact/${task.attributes.clientInformation.hs_object_id}`;
    }
    return crmDefaultUrl;
  };

  return {
    // top header
    MainHeader: {
      Container: {
        background: '#583cb3',
        color: cSolitude,
      },
    },

    // left sidebar
    SideNav: {
      Container: {
        background: cSolitude,
        color: cBlue,
      },
      Button: {
        background: cSolitude,
        color: cBlue,
        lightHover: !lightTheme,
      },
      Icon: {
        color: cBlue,
      },
    },
    UserActivityControls: {
      Item: {
        color: '#fff',
        lightHover: true,
      },
      Items: {
        background: cBlue,
      },
    },

    // admin plugin
    FlexAdmin: {
      DashboardCard: {
        Icon: {
          background: cBlue,
          color: cSolitude,
        },
      },
    },
  };
};
