import React, { useState, useEffect } from 'react';
import { Button } from '@twilio-paste/core/button';
import { Modal, ModalBody, ModalFooter, ModalFooterActions, ModalHeader, ModalHeading } from '@twilio-paste/core/modal';

export function SaveTaskDetails(props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const handleOpen = () => setIsOpenModal(true);
  const handleClose = () => setIsOpenModal(false);
  const [taskDetails, setTaskDetails] = useState(props.task.attributes.taskDetails);

  useEffect(() => {
    props.task.setAttributes({
      ...props.task.attributes,
      taskDetails,
    });
  }, [isOpenModal]);

  return (
    <>
      <Button variant="primary" onClick={handleOpen} element="TASK_DETAILS_BUTTON">
        Detalhes
      </Button>
      {isOpenModal && (
        <Modal ariaLabelledby="task-details-modal" isOpen={isOpenModal} onDismiss={handleClose} size="default">
          <ModalHeader>
            <ModalHeading as="h3" id="task-details-modal">
              Descrição do Atendimento
            </ModalHeading>
          </ModalHeader>
          <ModalBody>
            <div>
              <span>Descreva o atendimento:</span>
            </div>
            <textarea style={{ width: '100%' }} rows={20} id="task-details-text" defaultValue={taskDetails} />
          </ModalBody>
          <ModalFooter>
            <ModalFooterActions>
              <Button variant="secondary" onClick={handleClose}>
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setTaskDetails(document.getElementById('task-details-text').value);
                  setIsOpenModal(false);
                }}
              >
                Salvar
              </Button>
            </ModalFooterActions>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
