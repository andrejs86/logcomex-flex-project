import { useState } from 'react';

import { Container, Modal, Divisor } from './styles';
import { getTasks } from '../../../utils/getTasks';
import TaskList from '../TaskList';
import Toastify from '../../../assets/toastify';
import '../../../assets/toastify.css';

const TasksTile = ({ tasks, firstStatus, secondStatus, firstTitle, secondTitle, id, name, firstIcon, secondIcon }) => {
  const [tasksInQueue, setTasksInQueue] = useState([]);
  const [intervalTasks, setIntervalTasks] = useState([]);
  const [onLoading, setOnLoading] = useState(false);
  const urlParams = `AssignmentStatus=${firstStatus}&AssignmentStatus=${secondStatus}&PageSize=2000`;

  function stopInterval(tasksInterval) {
    for (const interval of tasksInterval) {
      clearInterval(interval);
    }
  }

  async function openModal() {
    const { success, errorMessage } = await getTasks(urlParams, setOnLoading, setTasksInQueue, setIntervalTasks);

    if (success) {
      const modal = document.querySelector(`#${id}`);
      modal.style.display = 'block';
    } else {
      setOnLoading(false);
      Toastify({
        duration: 5000,
        text: `Falha ao carregar a lista de tarefas - Tente novamente - Erro: ${errorMessage}`,
        className: 'info',
        close: true,
        style: {
          background: 'rgb(255, 95, 109)',
        },
      }).showToast();
    }
  }

  function closeModal() {
    const modal = document.querySelector(`#${id}`);
    modal.style.display = 'none';
    setTasksInQueue([]);
    stopInterval(intervalTasks);
  }

  window.onclick = (event) => {
    const modal = document.querySelector(`#${id}`);
    if (event.target === modal) {
      modal.style.display = 'none';
      setTasksInQueue([]);
      stopInterval(intervalTasks);
    }
  };

  return (
    <>
      <Container onClick={openModal}>
        <span>{name}</span>
        <p>{tasks}</p>

        {onLoading && (
          <div className="load-4">
            <div className="ring-1"></div>
          </div>
        )}
      </Container>
      <Modal id={id}>
        <div className="modal-content">
          <span className="close" onClick={closeModal}>
            &times;
          </span>
          <TaskList
            tasksByQueue={tasksInQueue}
            title={firstTitle}
            status={firstStatus}
            Icon={firstIcon}
            tile={true}
            closeModal={closeModal}
          />
          <Divisor />
          <TaskList
            tasksByQueue={tasksInQueue}
            title={secondTitle}
            status={secondStatus}
            Icon={secondIcon}
            tile={true}
            closeModal={closeModal}
          />
        </div>
      </Modal>
    </>
  );
};

export default TasksTile;
