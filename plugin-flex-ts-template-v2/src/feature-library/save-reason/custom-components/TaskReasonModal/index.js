import React, { useState, useEffect } from 'react';
import { Actions, withTaskContext } from '@twilio/flex-ui';
import { Button } from '@twilio-paste/core/button';
import { Select, Option, OptionGroup } from '@twilio-paste/core/select';
import { TextArea } from '@twilio-paste/core/textarea';
import { Label } from '@twilio-paste/core/label';
import { Modal, ModalBody, ModalFooter, ModalFooterActions, ModalHeader, ModalHeading } from '@twilio-paste/core/modal';
import { Input } from '@twilio-paste/core/input';
import { Flex } from '@twilio-paste/core/flex';
import { Tooltip } from '@twilio-paste/core/tooltip';
import { Spinner } from '@twilio-paste/core/spinner';
import {
  DescriptionList,
  DescriptionListSet,
  DescriptionListTerm,
  DescriptionListDetails,
} from '@twilio-paste/core/description-list';
import { Badge } from '@twilio-paste/core/badge';
import { HelpText } from '@twilio-paste/core/help-text';
import { Box } from '@twilio-paste/core/box';
import { Separator } from '@twilio-paste/core/separator';
import { CallIcon } from '@twilio-paste/icons/esm/CallIcon';
import { ChatIcon } from '@twilio-paste/icons/esm/ChatIcon';
import { InformationIcon } from '@twilio-paste/icons/esm/InformationIcon';
import { WarningIcon } from '@twilio-paste/icons/esm/WarningIcon';
import { ErrorIcon } from '@twilio-paste/icons/esm/ErrorIcon';

import * as config from '../../config';
import HubspotService from '../../utils/HubspotService';
import TaskRouterService from '../../../../utils/serverless/TaskRouter/TaskRouterService';

const TaskReasonModal = (props) => {
  const flex = props.flex;
  const task = props.task;
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [outcomeOptions, setOutcomeOptions] = useState([]);
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedDeal, setSelectedDeal] = useState();
  const [newEmail, setNewEmail] = useState('');
  const [alertContactNotFound, setAlertContactNotFound] = useState();
  const [deals, setDeals] = useState();
  const [wrapupTimeout, setWrapupTimeout] = useState(config.getWrapupTimeout());
  const reasons = config.getAllReasons();
  let timeout;

  useEffect(() => {
    if (alertContactNotFound) {
      setTimeout(() => {
        setAlertContactNotFound();
      }, 5000);
    }
  }, [alertContactNotFound]);

  useEffect(() => {
    async function fetchData() {
      const { types, outcomes } = await HubspotService.GetTypeAndOutcome();

      setTypeOptions(types);
      setOutcomeOptions(outcomes);

      const { deals, success } = await HubspotService.GetDeals(
        task?.attributes?.clientInformation?.hs_object_id,
        task?.attributes?.clientInformation?.associatedcompanyid,
      );

      if (success) {
        setDeals(deals);
      }
    }

    fetchData();

    props.flex.Actions.addListener('beforeCompleteTask', (payload, abortFunction) => {
      if (payload.task.attributes.reasonSelected) {
        console.log('Reason is selected. Completing task...');
      } else {
        console.log('Reason is not selected, opening modal...');
        setIsOpenModal(true);
        abortFunction();
      }
    });
    console.log('beforeCompleteTask listener added');
  }, []);

  useEffect(() => {
    clearTimeout(timeout);

    if (wrapupTimeout === 0) onEndTask(true);
    else {
      timeout = setTimeout(() => {
        setWrapupTimeout(wrapupTimeout - 1);
      }, 1000);
    }
  }, [wrapupTimeout]);

  function setSelectedReason(selectedReason) {
    let selectedTopic;
    for (const reason of reasons) {
      if (reason.options.find((o) => o === selectedReason)) {
        selectedTopic = reason.topic;
        break;
      }
    }
    setCurrentTopic(selectedTopic.toUpperCase());
    setSelectedOption(selectedReason);
  }

  async function onEndTask(wasTimeouted = false) {
    try {
      setIsLoading(true);
      setButtonDisabled(true);

      let taskDetails = 'Sem descrição de atendimento informada ou não foi possível salvar os dados';
      if (newEmail !== '') {
        const clientInformationReturn = await HubspotService.GetNewClientInformation(newEmail);

        if (clientInformationReturn) {
          task.attributes.clientInformation = clientInformationReturn;
        } else {
          setAlertContactNotFound(
            'Contato não encontrado no Hubspot, por favor informe o e-mail de um contato cadastrado.',
          );

          setButtonDisabled(false);
          setIsLoading(false);
          return;
        }
      }

      if (document.getElementById('confirm-task-details')) {
        taskDetails = document.getElementById('confirm-task-details').value;
      }

      if (wasTimeouted) {
        taskDetails += '\nNÃO PREENCHIDO PELO AGENTE';
      }

      let conversations = {};
      if (task.attributes.hasOwnProperty('conversations')) {
        conversations = {
          ...task.attributes.conversations,
          conversation_attribute_6: currentTopic.toUpperCase(),
          conversation_attribute_7: selectedOption.toUpperCase(),
        };
      } else {
        conversations = {
          conversation_attribute_6: currentTopic.toUpperCase(),
          conversation_attribute_7: selectedOption.toUpperCase(),
        };
      }

      await task.setAttributes({
        ...task.attributes,
        clientInformation: task.attributes.clientInformation,
        conversations,
        taskDetails: `${currentTopic} - ${selectedOption}\n\n${taskDetails}`,
        call_type: selectedType,
        call_outcome:
          task.attributes.direction === 'inbound' ? 'a4c4c377-d246-4b32-a13b-75a56a4cd0ff' : selectedOutcome, // se é inbound, marcar como conectado
        newEmail,
      });

      await saveHistory(flex, task, selectedDeal, setIsOpenModal, setButtonDisabled);
    } catch (err) {
      console.error(err);
    }
  }

  const saveHistoryMethod = async (flex, task, workerAttributes, selectedDeal, setButtonDisabled, setIsOpenModal) => {
    try {
      task.attributes.taskSid = task.sid;

      const responseSaveHistory = await HubspotService.SaveHistory(
        task.attributes,
        task.dateCreated,
        task.dateUpdated,
        workerAttributes,
        task.taskChannelUniqueName,
        selectedDeal,
      );

      if (responseSaveHistory) {
        await task.setAttributes({
          ...task.attributes,
          reasonSelected: true,
        });
        setIsOpenModal(false);
        console.log('invoking CompleteTask', task.sid);
        Actions.invokeAction('CompleteTask', { sid: task.sid });
      } else {
        setButtonDisabled(false);
        setIsLoading(false);
        if (confirm('Erro ao salvar no Hubspot. Este contato pode não ser vinculado. Deseja finalizar mesmo assim?')) {
          await task.setAttributes({
            ...task.attributes,
            reasonSelected: true,
          });
          console.log('invoking FORCED CompleteTask', task.sid);
          Actions.invokeAction('CompleteTask', { sid: task.sid });
          setIsOpenModal(false);
        }
      }
    } catch (err) {
      console.error('could not save history to Hubspot', err);
      setButtonDisabled(false);
      setIsLoading(false);
      if (confirm('Contato não encontrado no Hubspot, não será vinculado. Deseja finalizar mesmo assim?')) {
        await task.setAttributes({
          ...task.attributes,
          reasonSelected: true,
        });
        console.log('invoking FORCED CompleteTask', task.sid);
        Actions.invokeAction('CompleteTask', { sid: task.sid });
        setIsOpenModal(false);
      }
    }
  };

  async function getSegmentLinkFallback(flex, task, workerAttributes, selectedDeal, setButtonDisabled, setIsOpenModal) {
    const data = await TaskRouterService.getTask(task.taskSid);
    const taskAttributes = data.attributes;
    const segmentLink = taskAttributes?.conversations?.segment_link;

    if (task.attributes.conversations) {
      task.attributes.conversations = {
        ...task.attributes.conversations,
        segment_link: segmentLink,
      };
    } else {
      task.attributes = {
        ...task.attributes,
        conversations: {
          segment_link: segmentLink,
        },
      };
    }

    await saveHistoryMethod(flex, task, workerAttributes, selectedDeal, setButtonDisabled, setIsOpenModal);
  }

  async function saveHistory(flex, task, selectedDeal, setIsOpenModal, setButtonDisabled) {
    const taskAttributes = task.attributes;
    const workerInstance = flex.Manager.getInstance().workerClient;
    const workerAttributes = {
      workerName: workerInstance.attributes.full_name || workerInstance.name,
      workerEmail: workerInstance.attributes.email,
    };

    if (!taskAttributes?.conversations?.segment_link) {
      setTimeout(async () => {
        await getSegmentLinkFallback(flex, task, workerAttributes, selectedDeal, setButtonDisabled, setIsOpenModal);
      }, 2000);

      return;
    }

    await saveHistoryMethod(flex, task, workerAttributes, selectedDeal, setButtonDisabled, setIsOpenModal);
  }

  return (
    <Modal
      id="modal-container"
      key="modal-container"
      isOpen={isOpenModal}
      onDismiss={() => setIsOpenModal(false)}
      size="wide"
      ariaLabelledby="save-reason-modal-header"
    >
      <ModalHeader>
        <Flex vertical>
          <Flex grow>
            <ModalHeading as="h2" id="save-reason-modal-header">
              Motivo de Atendimento
            </ModalHeading>
          </Flex>
          <Flex grow>
            {task.channelType === 'voice' ? (
              <CallIcon decorative={false} title="ID da Tarefa" />
            ) : (
              <ChatIcon decorative={false} title="ID da Tarefa" />
            )}
            &nbsp;{task.sid}
          </Flex>
        </Flex>
      </ModalHeader>
      <ModalBody>
        {isLoading && (
          <Box
            style={{
              position: 'fixed',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.2)',
              zIndex: 999,
              borderRadius: '4px',
            }}
          >
            <Flex grow height="100%" hAlignContent="center" vAlignContent="center">
              <Spinner decorative={false} title="Carregando" size="sizeIcon80" />
            </Flex>
          </Box>
        )}
        <Flex>
          <Flex grow shrink basis="1px">
            <Box width="100%">
              {/* Tópico */}
              <Box marginBottom="space80">
                <Label required htmlFor="save-reason-select-topic">
                  Motivo:
                </Label>
                <Select
                  required
                  onChange={(e) => setSelectedReason(e.target.value)}
                  id="save-reason-select-topic"
                  value={currentTopic === '' ? 'defaultReasonSelectValue' : undefined}
                >
                  <Option value="Selecione um motivo..." hidden>
                    Selecione um motivo...
                  </Option>
                  {reasons.map((reason, i) => {
                    return (
                      <OptionGroup label={reason.topic} key={`topic_optgroup_${i}`}>
                        {reason.options.map((option, j) => {
                          return (
                            <Option value={option} key={`topic_option_${j}`}>
                              {option}
                            </Option>
                          );
                        })}
                      </OptionGroup>
                    );
                  })}
                </Select>
              </Box>

              {/* Outcomes */}
              {task.channelType === 'voice' && (
                <>
                  {task.attributes.direction === 'outbound' && (
                    <Box marginBottom="space80">
                      <Label required htmlFor="save-reason-select-outcome">
                        Outcome:
                      </Label>
                      <Select
                        required
                        id="save-reason-select-outcome"
                        onChange={(e) => setSelectedOutcome(e.target.value)}
                      >
                        <Option value="Selecione um outcome..." hidden>
                          Selecione um Outcome...
                        </Option>
                        {outcomeOptions.map((reason, i) => {
                          return (
                            <Option value={reason.id} className="reasonTopic" key={`reasonTopic_${i}`}>
                              {reason.label}
                            </Option>
                          );
                        })}
                      </Select>
                    </Box>
                  )}
                  <Box marginBottom="space80">
                    <Label required htmlFor="save-reason-select-type">
                      Tipo de Call:
                    </Label>
                    <Select required id="save-reason-select-type" onChange={(e) => setSelectedType(e.target.value)}>
                      <Option value="Selecione um type..." hidden>
                        Selecione um tipo de Call...
                      </Option>
                      {typeOptions.map((reason, i) => {
                        return (
                          <Option value={reason.value} className="reasonTopic" key={`reasonTopic_${i}`}>
                            {reason.label}
                          </Option>
                        );
                      })}
                    </Select>
                  </Box>
                </>
              )}

              {/* Deals */}
              {deals && (
                <Box marginBottom="space80">
                  <Label required htmlFor="save-reason-select-business">
                    Negócio:
                  </Label>
                  <Select required id="save-reason-select-business" onChange={(e) => setSelectedDeal(e.target.value)}>
                    <Option value="Selecione um negócio..." hidden>
                      Selecione um negócio...
                    </Option>
                    <OptionGroup label="Negócios do contato">
                      {deals?.contactDeals?.length > 0 &&
                        deals.contactDeals.map((deal, i) => {
                          return (
                            <Option value={deal.id} key={`contactDealTopic_${i}`}>
                              {deal.properties.dealname}
                            </Option>
                          );
                        })}
                    </OptionGroup>
                    <OptionGroup label="Negócios da empresa">
                      {deals?.companyDeals?.length > 0 &&
                        deals.companyDeals.map((deal, i) => {
                          return (
                            <Option value={deal.id} key={`contactDealTopic_${i}`}>
                              {deal.properties.dealname}
                            </Option>
                          );
                        })}
                    </OptionGroup>
                  </Select>
                </Box>
              )}
            </Box>
          </Flex>
          <Flex vAlignContent="center">
            <Box width="1.75rem" verticalAlign="middle">
              <Separator orientation="vertical" horizontalSpacing="space40" />
            </Box>
          </Flex>
          <Flex grow shrink basis="1px">
            <Box width="100%">
              {task.attributes.clientInformation && (
                <Box marginBottom="space80">
                  <DescriptionList>
                    <DescriptionListSet>
                      <DescriptionListTerm>Contato Identificado</DescriptionListTerm>
                      <DescriptionListDetails>
                        {task.attributes.clientInformation.firstname} {task.attributes.clientInformation.lastname}
                      </DescriptionListDetails>
                      <DescriptionListDetails>{task.attributes.clientInformation.email}</DescriptionListDetails>
                    </DescriptionListSet>
                  </DescriptionList>
                </Box>
              )}

              <Box marginBottom="space80">
                <Label required={!task.attributes.clientInformation} htmlFor="save-reason-newemail">
                  E-mail do Contato:
                </Label>
                <Input
                  required={!task.attributes.clientInformation}
                  id="save-reason-newemail"
                  aria-describedby="email_help_text"
                  type="email"
                  placeholder="email@email.com"
                  onChange={(e) => setNewEmail(e.target.value)}
                ></Input>
                {task.attributes.clientInformation ? (
                  <HelpText id="new_email_help_text">
                    Se deseja alterar o contato para cadastro do histórico, informe o email do novo contato
                  </HelpText>
                ) : (
                  <HelpText id="email_help_text">Informe o e-mail do contato para registro no Hubspot</HelpText>
                )}
              </Box>

              {alertContactNotFound && (
                <Box marginBottom="space80">
                  <span style={{ color: 'red' }}>{alertContactNotFound}</span>
                </Box>
              )}
            </Box>
          </Flex>
        </Flex>

        {/* Task Details */}
        <Box marginBottom="space80">
          <Label htmlFor="confirm-task-details">Detalhes do atendimento:</Label>
          <TextArea id="confirm-task-details" defaultValue={task.attributes.taskDetails} resize="vertical" />
        </Box>
      </ModalBody>
      <ModalFooter>
        <ModalFooterActions justify="start">
          <Box>
            <Tooltip text="Tempo até o encerramento automático.">
              {wrapupTimeout > 60 ? (
                <Badge as="span" variant="neutral">
                  <InformationIcon decorative title="Tempo restante para o encerramento automático" />
                  {wrapupTimeout} seg.
                </Badge>
              ) : wrapupTimeout <= 60 && wrapupTimeout > 30 ? (
                <Badge as="span" variant="warning">
                  <WarningIcon decorative title="Tempo restante para o encerramento automático" />
                  {wrapupTimeout} seg.
                </Badge>
              ) : wrapupTimeout <= 30 && wrapupTimeout > 0 ? (
                <Badge as="span" variant="error">
                  <ErrorIcon decorative title="Tempo restante para o encerramento automático" />
                  {wrapupTimeout} seg.
                </Badge>
              ) : (
                <Badge as="span" variant="error">
                  <ErrorIcon decorative title="Tempo restante para o encerramento automático" />
                  Encerrando...
                </Badge>
              )}
            </Tooltip>
          </Box>
        </ModalFooterActions>
        <ModalFooterActions>
          <Box>
            <Button
              variant="primary"
              onClick={() => {
                clearTimeout(timeout);
                onEndTask();
              }}
              disabled={selectedOption === '' || buttonDisabled}
            >
              Confirmar
            </Button>
          </Box>
        </ModalFooterActions>
      </ModalFooter>
    </Modal>
  );
};

export default withTaskContext(TaskReasonModal);
