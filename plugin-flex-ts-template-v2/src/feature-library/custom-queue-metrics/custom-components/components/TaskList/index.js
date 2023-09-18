/* eslint-disable radix */
import axios from 'axios';

import Toastify from '../../../assets/toastify';
import '../../../assets/toastify.css';
import { Container, TaskHeader } from './styles';
import TransferModal from '../TransferModal';

const TaskList = ({ tasksByQueue, title, status, Icon, tile, setModalOpened, closeModal }) => {
  const urlFinishTask = `https://${process.env.FLEX_APP_SERVERLESS_FUNCTONS_DOMAIN}/task-update/cancel-or-complete`;

  async function completeTask(taskSid, customer, task) {
    const errorText = `Falha ao finalizar a tarefa do cliente ${customer} - Tente novamente - Erro:`;

    if (window.confirm(`Você realmente quer finalizar a tarefa do cliente ${customer}?`)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      task = {
        ...task,
        status: task.assignment_status,
      };
      try {
        const { data } = await axios.post(urlFinishTask, {
          taskSid,
        });

        if (data.success) {
          Toastify({
            duration: 5000,
            text: `Tarefa do cliente ${customer} finalizada com sucesso`,
            className: 'info',
            close: true,
            style: {
              background: 'linear-gradient(to right, #00b09b, #96c93d)',
            },
          }).showToast();

          if (setModalOpened) {
            setModalOpened(false);
          } else if (closeModal) {
            closeModal();
          }
        } else {
          Toastify({
            duration: 5000,
            text: `${errorText} ${data.message}`,
            className: 'info',
            close: true,
            style: {
              background: 'rgb(255, 95, 109)',
            },
          }).showToast();
        }
      } catch (error) {
        Toastify({
          duration: 5000,
          text: `${errorText} ${error.message}`,
          className: 'info',
          close: true,
          style: {
            background: 'rgb(255, 95, 109)',
          },
        }).showToast();
      }
    } else {
      console.log('##### Usuário cancelou o processo de finalizar a tarefa');
    }
  }

  return (
    <Container>
      <div className="div-activity-modal custom-activity-modal">
        <Icon />
        <span className="task-state">{title}</span>
      </div>
      {tasksByQueue
        .filter((tasks) => tasks.assignment_status === status)
        .map((task) => {
          const hours = parseInt(task.age / 3600);
          const minutes = parseInt((task.age - hours * 3600) / 60);
          const seconds = parseInt(task.age % 60, 10);

          const customerPhone = task.attributes?.clientInformation
            ? task.attributes.clientInformation?.phone
              ? task.attributes.clientInformation?.phone
                ? task.attributes.clientInformation?.phone
                : task.attributes.clientInformation?.mobilephone
              : task.attributes.customers?.phone
            : 'Sem registro';

          const customerFirstName = task.attributes?.clientInformation
            ? `${task.attributes.clientInformation.firstname}`
            : task.attributes.name
            ? task.attributes.name
            : '';

          const customerLastName = task?.attributes?.clientInformation
            ? task.attributes?.clientInformation?.lastname
              ? task.attributes?.clientInformation?.lastname
              : ''
            : 'Sem registro';

          const customer = `${customerFirstName} ${customerLastName} (${customerPhone})`;
          const channelType = task.attributes.conference ? 'Voz' : 'WhatsApp';

          const customerOrganization = task.attributes.customers && task.attributes.customers.organization;

          return (
            <li key={task.sid} className="only-task">
              <TransferModal task={task} />
              <TaskHeader>
                <span className="custom-bold-text">
                  {customer} - {channelType}
                </span>
                <div className="buttons-container">
                  <button className="finish" onClick={async () => completeTask(task.sid, customer, task)}>
                    Finalizar
                  </button>
                  {!task.attributes.conference && (
                    <button
                      className="transfer"
                      onClick={() => {
                        document.getElementById(`transfer-modal-${task.sid}`).style.display = 'block';
                      }}
                    >
                      Transferir
                    </button>
                  )}
                </div>
              </TaskHeader>
              <br />
              <span>{customerOrganization}</span>
              {task.attributes.conversations && task.attributes.conversations.conversation_attribute_2 && (
                <p>
                  <span className="custom-bold-text">Guardião:</span>{' '}
                  {task.attributes.conversations.conversation_attribute_2}
                </p>
              )}
              <p>
                <span className="custom-bold-text">Agente do atendimento:</span> {task.workerName}
              </p>
              {tile ? (
                <p>
                  <span className="custom-bold-text">Fila:</span> {task.queue ? task.queue : ''}
                </p>
              ) : (
                ''
              )}
              {task.attributes.conversations && task.attributes.conversations.selected_option_on_flow && (
                <p>
                  <span className="custom-bold-text">Opção selecionada no fluxo:</span>{' '}
                  {task.attributes.conversations.selected_option_on_flow}
                </p>
              )}
              <span className="custom-bold-text" id={task.sid}>
                {`Tempo total: ${
                  hours === 0
                    ? // eslint-disable-next-line sonarjs/no-nested-template-literals
                      `${String(minutes).padStart(2, '0')}min ${String(seconds).padStart(2, '0')}s`
                    : // eslint-disable-next-line sonarjs/no-nested-template-literals
                      `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}min ${String(
                        seconds,
                      ).padStart(2, '0')}s`
                }`}
              </span>
            </li>
          );
        })}
    </Container>
  );
};

export default TaskList;
