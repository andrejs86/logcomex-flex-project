import { Icon, Actions } from '@twilio/flex-ui';
import { useState } from 'react';
import { useUID } from '@twilio-paste/core/uid-library';
import { Button } from '@twilio-paste/core/button';
import { Modal, ModalBody, ModalHeader, ModalHeading } from '@twilio-paste/core/modal';
import { Input } from '@twilio-paste/core/input';
import { Label } from '@twilio-paste/core/label';
import { Callout, CalloutHeading, CalloutText, Checkbox } from '@twilio-paste/core';

import { HubspotIcon, PhoneContainer, SuspendedContainer } from './styles';
import { getEveryoneQueueSid, getInternationalQueueSid } from '../../config';
import HubspotService from '../../utils/HubspotService';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars
const css = require('./styles.css');

const HubspotModal = ({ worker }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [statusMessage, setStatusMessage] = useState('Busque por nome, telefone, e-mail ou empresa');
  const [activityMessage] = useState('Ligação bloqueada pois você está indisponível');
  const [isInternational, setIsInternational] = useState(false);
  const [openCompanies, setOpenCompanies] = useState(true);
  const [openContacts, setOpenContacts] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    resetStates();
    setIsOpen(false);
  };
  const modalHeadingID = useUID();

  const searchContacts = async () => {
    setLoadingData(true);
    if (searchValue.length < 2) {
      setStatusMessage('Informe pelo menos 2 caracteres para realizar uma busca');
      return;
    }

    setStatusMessage('Buscando...');
    const data = await HubspotService.searchClient(searchValue);
    console.log(data);
    if (data.result.length === 0 && data.companies.length === 0) {
      setStatusMessage(`A busca por "${searchValue}" não retornou nenhum resultado`);
    } else {
      setStatusMessage('Busque por nome, telefone, e-mail ou empresa');
    }

    setContacts(data.result);
    setCompanies(data.companies);
    setOpenCompanies(true);
    setOpenContacts(true);
    setLoadingData(false);
  };

  const resetStates = () => {
    setIsOpen(false);
    setStatusMessage('Busque por nome, telefone, e-mail ou empresa');
    setSearchValue('');
    setContacts([]);
    setCompanies([]);
    setIsInternational(false);
    setOpenCompanies(true);
    setOpenContacts(true);
  };

  const outboundCall = (phone) => {
    Actions.invokeAction('StartOutboundCall', {
      destination: `${phone}`,
      queueSid: isInternational ? getInternationalQueueSid() : getEveryoneQueueSid(),
    });

    resetStates();
  };

  const whatsappMessage = (phone) => {
    console.log(phone);
    Actions.invokeAction('NavigateToView', {
      viewName: `whatsapp-view?phone=+${phone}`,
    });

    resetStates();
  };

  const formatNumber = (phone) => {
    return phone
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '+$1 $2')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})(\d)/, '$1');
  };

  return (
    <>
      <HubspotIcon>
        <img onClick={handleOpen} alt="Hubspot" src="https://i.imgur.com/tZvRJlg.png" />
      </HubspotIcon>
      {isOpen && (
        <Modal ariaLabelledby={modalHeadingID} isOpen={isOpen} onDismiss={handleClose} size="default">
          <ModalHeader>
            <ModalHeading as="h3" id={modalHeadingID}>
              Hubspot
            </ModalHeading>
          </ModalHeader>
          <ModalBody>
            <div className="modal-content">
              <div className="header-section">
                <div className="search-section">
                  <Label htmlFor="buscaContatoInput" required>
                    Pesquisa de Contato:
                  </Label>
                  <Input
                    id="buscaContatoInput"
                    name="buscaContatoInput"
                    type="text"
                    value={searchValue}
                    placeholder="Buscar por nome, telefone, e-mail ou empresa"
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !loadingData) {
                        searchContacts();
                      }
                    }}
                  />{' '}
                  <br />
                  <Button
                    variant="primary"
                    disabled={statusMessage === 'Buscando...' && !loadingData}
                    className="action-button"
                    onClick={async () => searchContacts()}
                  >
                    <img src="https://i.imgur.com/CQsFguj.png" />
                    Pesquisar
                  </Button>
                </div>
              </div>
              <div className="results-section">
                {!worker.activity.available && contacts.length !== 0 && (
                  <div style={{ padding: '0px' }}>
                    <span className="no-contacts no-available">{activityMessage}</span>
                  </div>
                )}

                {worker.attributes &&
                  worker.attributes.routing &&
                  worker.attributes.routing.skills &&
                  worker.attributes.routing.skills.includes('international') &&
                  worker.activity.available &&
                  contacts.length !== 0 && (
                    <Checkbox
                      checked={isInternational}
                      id="internationalCheckbox"
                      value="internationalCheckbox"
                      name="internationalCheckbox"
                      onChange={() => {
                        setIsInternational(!isInternational);
                      }}
                    >
                      Ligação Internacional
                    </Checkbox>
                  )}

                {companies?.length > 0 && (
                  <SuspendedContainer
                    className="button-open-companies"
                    onClick={() => setOpenCompanies(!openCompanies)}
                  >
                    <span>
                      <Icon icon={openCompanies ? 'ArrowDown' : 'ArrowRight'} />
                    </span>
                    Empresas
                  </SuspendedContainer>
                )}
                {openCompanies &&
                  companies?.length > 0 &&
                  companies.map((company) => (
                    <div className="contact" key={company.id}>
                      <div className="contact-info">
                        <span className="contact-name">{company.name}</span>
                        {company.phone && (
                          <PhoneContainer>
                            <span>{formatNumber(company.phone)}</span>
                            <Button
                              variant="secondary"
                              disabled={!worker.activity.available}
                              onClick={() => outboundCall(company.phone)}
                            >
                              <Icon icon="CallBold" />
                            </Button>
                          </PhoneContainer>
                        )}
                        <span>{company.industry}</span>
                        <span>
                          {company.city} - {company.state}
                        </span>
                      </div>
                    </div>
                  ))}

                {contacts?.length > 0 && (
                  <SuspendedContainer className="button-open-companies" onClick={() => setOpenContacts(!openContacts)}>
                    <span>
                      <Icon icon={openContacts ? 'ArrowDown' : 'ArrowRight'} />
                    </span>
                    Contatos
                  </SuspendedContainer>
                )}

                {openContacts && contacts.length === 0 ? (
                  <>
                    <div style={{ padding: '0px' }}>
                      <span className="no-contacts">{statusMessage}</span>
                    </div>
                    <Callout variant="neutral">
                      <CalloutHeading as="h2">Como pesquisar?</CalloutHeading>
                      <CalloutText>
                        Para realizar buscas com partes do nome use '<strong style={{ fontWeight: 'bolder' }}>*</strong>
                        '.
                        <br />
                        <span style={{ textDecoration: 'underline' }}>Por exemplo</span>:{' '}
                        <strong style={{ fontWeight: 'bolder' }}>logcome*</strong> ou{' '}
                        <strong style={{ fontWeight: 'bolder' }}>*ogcomex</strong>
                      </CalloutText>
                    </Callout>
                  </>
                ) : (
                  openContacts &&
                  contacts.map((contact) => (
                    <div className="contact" key={contact.id}>
                      <div className="contact-info">
                        <span className="contact-name">{contact.name}</span>
                        <span style={{ fontStyle: 'italic' }}>{contact.company}</span>
                        {contact.phone && (
                          <PhoneContainer>
                            <span>{formatNumber(contact.phone)}</span>
                            <Button
                              variant="secondary"
                              disabled={!worker.activity.available}
                              onClick={() => outboundCall(contact.phone)}
                            >
                              <Icon icon="CallBold" />
                            </Button>
                            <Button variant="secondary" onClick={() => whatsappMessage(contact.phone)}>
                              <Icon icon="WhatsappBold" />
                            </Button>
                          </PhoneContainer>
                        )}
                        {contact.mobilePhone && (
                          <PhoneContainer>
                            <span>{formatNumber(contact.mobilePhone)}</span>
                            <Button
                              variant="secondary"
                              disabled={!worker.activity.available}
                              onClick={() => outboundCall(contact.mobilePhone)}
                            >
                              <Icon icon="CallBold" />
                            </Button>
                            <Button variant="secondary" onClick={() => whatsappMessage(contact.mobilePhone)}>
                              <Icon icon="WhatsappBold" />
                            </Button>
                          </PhoneContainer>
                        )}
                        <span>{contact.email}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default HubspotModal;
