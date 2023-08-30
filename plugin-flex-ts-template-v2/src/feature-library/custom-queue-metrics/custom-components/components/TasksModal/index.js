import { Icon } from '@twilio/flex-ui';
import { useState } from 'react';
import { Modal, ModalBody, ModalHeader, ModalHeading } from '@twilio-paste/core/modal';
import { useUID } from '@twilio-paste/core/uid-library';
import { Button } from '@twilio-paste/core';
import { ExpandIcon } from '@twilio-paste/icons/esm/ExpandIcon';

import Toastify from '../../../assets/toastify';
import '../../../assets/toastify.css';
import { ButtonList, Divisor, List } from './styles';
import TaskList from '../TaskList';
import {
  WaitingOnQueue,
  WaitingOnAgent,
  OnAttendance,
  OnFinish,
  Available,
  Unavailable,
} from '../../../assets/svg-icons';
import WorkersList from '../WorkersList';
import { getTasks } from '../../../utils/getTasks';
import { getWorkers } from '../../../utils/getWorkers';
import { getActivities } from '../../../utils/getActivities';

const TasksModal = ({ items }) => {
  const [tasksByQueue, setTasksByQueue] = useState([]);
  const [intervalTasks, setIntervalTasks] = useState([]);
  const [onLoading, setOnLoading] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isAgents, setIsAgents] = useState(true);
  const [isTasks, setIsTasks] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const modalHeadingID = useUID();
  const handleClose = () => {
    setTasksByQueue([]);
    stopInterval(intervalTasks);
    setModalOpened(false);
  };
  const taskStatus = [
    {
      title: 'Em espera na fila',
      status: 'pending',
      icon: WaitingOnQueue,
    },
    {
      title: 'Aguardando atendimento do agente',
      status: 'reserved',
      icon: WaitingOnAgent,
    },
    {
      title: 'Em atendimento',
      status: 'assigned',
      icon: OnAttendance,
    },
    {
      title: 'Aguardando finalização',
      status: 'wrapping',
      icon: OnFinish,
    },
  ];

  function stopInterval(tasksInterval) {
    for (const interval of tasksInterval) {
      clearInterval(interval);
    }
  }

  async function buttonPush(items) {
    const { success, errorMessage } = await getTasks(
      `TaskQueueSid=${items.key}&PageSize=200`,
      setOnLoading,
      setTasksByQueue,
      setIntervalTasks,
    );
    const workersBySkills = await getWorkers(items.friendly_name);
    const activitiesList = await getActivities();

    if (!success) {
      Toastify({
        duration: 5000,
        text: `Falha ao carregar a lista de tarefas - Tente novamente - Erro: ${errorMessage}`,
        className: 'info',
        close: true,
        style: {
          background: 'rgb(255, 95, 109)',
        },
      }).showToast();
      setOnLoading(false);
      return;
    }

    setActivities(activitiesList.data);
    setWorkers(workersBySkills.data);
    setModalOpened(true);
  }

  return (
    <>
      {modalOpened && (
        <Modal ariaLabelledby={modalHeadingID} isOpen={modalOpened} onDismiss={handleClose} size="wide">
          <ModalHeader>
            <ModalHeading as="h3" id={modalHeadingID}>
              <span className="queue-text">Fila '{items.friendly_name}'</span>
            </ModalHeading>
          </ModalHeader>
          <ModalBody>
            <div className="modal-content">
              <div className="text-modal">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsAgents(true);
                    setIsTasks(false);
                  }}
                  className={isAgents ? 'active modal-button' : 'modal-button'}
                >
                  Agentes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsTasks(true);
                    setIsAgents(false);
                  }}
                  className={isTasks ? 'active modal-button' : 'modal-button'}
                >
                  Tarefas
                </Button>

                {isAgents
                  ? activities
                      .sort((a, b) => b.available - a.available)
                      .map((activity) => (
                        <div className="tasks-list" key={activity.sid}>
                          <WorkersList
                            workers={workers}
                            title={activity.friendly_name}
                            Icon={activity.available ? Available : Unavailable}
                            status={activity.friendly_name}
                          />
                          <Divisor />
                        </div>
                      ))
                  : taskStatus.map((status) => (
                      <div className="tasks-list" key={JSON.stringify(status)}>
                        <TaskList
                          tasksByQueue={tasksByQueue}
                          title={status.title}
                          status={status.status}
                          Icon={status.icon}
                          setModalOpened={setModalOpened}
                        />
                        <Divisor />
                      </div>
                    ))}
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}
      <Button
        style={{ width: 'fit-content !important' }}
        variant="secondary"
        onClick={() => {
          buttonPush(items);
        }}
      >
        <ExpandIcon decorative={false} title="Ver detalhes" />
      </Button>
      <span style={{ marginLeft: '5px' }}>{items.friendly_name} </span>
      {onLoading && (
        <div className="load-4">
          <div className="ring-1"></div>
        </div>
      )}
      {items.channels &&
        items.channels.length > 1 &&
        items.channels &&
        items.channels.map((channel) => (
          <li key={channel.unique_name} className="channel-list">
            <Icon icon="Whatsapp" />
            {channel.unique_name}
          </li>
        ))}
    </>
  );
};

export default TasksModal;
