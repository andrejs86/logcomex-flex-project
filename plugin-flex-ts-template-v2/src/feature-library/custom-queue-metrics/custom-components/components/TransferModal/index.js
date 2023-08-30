import { WorkerDirectoryTabs } from '@twilio/flex-ui';

import { Modal, DirectoryContainer } from './styles';

const TransferModal = ({ task }) => {
  return (
    <Modal id={`transfer-modal-${task.sid}`} className="modal">
      <div className="modal-content">
        <span
          className="close"
          onClick={() => {
            document.getElementById(`transfer-modal-${task.sid}`).style.display = 'none';
          }}
        >
          &times;
        </span>
        <span>{task.attributes.name}</span>
        <DirectoryContainer>
          <WorkerDirectoryTabs key="custom-worker-directory" task={task} />
        </DirectoryContainer>
      </div>
    </Modal>
  );
};

export default TransferModal;
