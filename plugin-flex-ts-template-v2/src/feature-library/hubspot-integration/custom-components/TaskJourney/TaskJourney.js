import React, { useState, useEffect } from 'react';
import { CloseIcon } from '@twilio-paste/icons/esm/CloseIcon';
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { ProductRegionalIcon } from '@twilio-paste/icons/esm/ProductRegionalIcon';
import { OrderedListIcon } from '@twilio-paste/icons/esm/OrderedListIcon';

import {
  AuthButton,
  Content,
  Guardian,
  Journey,
  Modal,
  TaskReason,
  International,
  InternationalButton,
} from './styles.js';

const TaskJourney = (props) => {
  const [modalOpened, setModalOpened] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [modal, setModal] = useState();

  useEffect(() => {
    if (props.task && props.task.attributes && props.task.attributes.transfers) {
      setTransfers(props.task.attributes.transfers);
    }
  }, []);

  async function executeFunctions(task) {
    setModalOpened(true);
    if (task && task.attributes && task.attributes.transfers) {
      setTransfers(task.attributes.transfers);
    }
  }

  const guardian =
    props.task &&
    props.task.attributes &&
    props.task.attributes.clientInformation &&
    props.task.attributes.clientInformation.guardian;
  const taskReason = props.task.attributes.reason;
  const user = props.manager.workerClient.attributes.email;
  const isOtherGuardian = guardian !== user;

  const isInternational =
    props.task &&
    props.task.attributes &&
    props.task.attributes.location &&
    props.task.attributes.location.toLowerCase() === 'international';

  window.onclick = (event) => {
    setModal(document.getElementById('custom-modal-transfer-journey'));
    if (event.target === modal) {
      setModalOpened(false);
    }
  };

  return (
    <>
      <AuthButton key="authComponent" authenticated={guardian} isOtherGuardian={isOtherGuardian}>
        <Guardian>
          {guardian !== undefined && guardian !== '' ? (
            <UserIcon decorative={false} title="Guardião identificado" />
          ) : (
            <CloseIcon decorative={false} title="Sem Guardião" />
          )}
          {guardian
            ? ` Guardião do cliente: ${guardian}`
            : ` Cliente sem guardião vinculado ou cadastro não encontrado`}
        </Guardian>
        {props.task &&
        props.task.attributes &&
        props.task.attributes.transfers &&
        props.task.attributes.transfers.length > 0 ? (
          <Journey onClick={async () => executeFunctions(props.task)}>
            <OrderedListIcon decorative={false} title="Jornada" />
            &nbsp;Ver Jornada
          </Journey>
        ) : (
          ''
        )}
      </AuthButton>
      {isInternational && (
        <InternationalButton key="intComponent">
          <International>
            <ProductRegionalIcon decorative={false} title="Internacional" />
            &nbsp;Internacional
          </International>
        </InternationalButton>
      )}

      {modalOpened && (
        <Modal id="custom-modal-transfer-journey" className="modal" key="custom-modal-transfer-journey">
          <div className="modal-content">
            <span
              className="close"
              onClick={async () => {
                setModalOpened(false);
              }}
            >
              &times;
            </span>
            <Content>
              <p className="title">Jornada de transferências do cliente</p>
              <ul>
                {transfers &&
                  transfers.length > 0 &&
                  transfers.map((transfer, index) => (
                    <li key={index}>
                      <span style={{ float: 'left' }}>{index + 1}.</span>
                      <p className="transfer-text">
                        <span>Agente da transferência:</span>{' '}
                        {transfer.workerFullName ? transfer.workerFullName : transfer.workerName}
                      </p>
                      {transfer.targetSid.startsWith('WK') ? (
                        <p className="transfer-text">
                          <span>Transferido para o agente:</span> {transfer.targetName}
                        </p>
                      ) : (
                        <p className="transfer-text">
                          <span>Transferido para a fila:</span> {transfer.targetName}
                        </p>
                      )}
                    </li>
                  ))}
              </ul>
            </Content>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TaskJourney;
