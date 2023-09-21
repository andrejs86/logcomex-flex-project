import axios from 'axios';
import * as Flex from '@twilio/flex-ui';

import * as config from '../config';
import { timer } from './timer';

export const getTasks = async (params, setOnLoading, setTasksByQueue, setIntervalTasks) => {
  try {
    const tokenAuthorization = `${Flex.Manager.getInstance().configuration.sso.accountSid}:${config.getAuthToken()}`;
    const buffer = Buffer.from(tokenAuthorization);

    const tokenFormatted = buffer.toString('base64');

    setOnLoading(true);
    const tasks = [];
    const listInterval = [];

    const { data } = await axios.get(
      `https://taskrouter.twilio.com/v1/Workspaces/${config.getWorkspaceSid()}/Tasks?${params}`,
      {
        headers: {
          Authorization: `Basic ${tokenFormatted}`,
        },
      },
    );

    const filteredTasks = data.tasks.filter(
      (task) => task.task_queue_friendly_name !== 'Tracker' && task.task_queue_friendly_name !== 'Survey',
    );

    for await (const task of filteredTasks) {
      const taskReservations = await axios.get(task.links.reservations, {
        headers: {
          Authorization: `Basic ${tokenFormatted}`,
        },
      });

      const reservation =
        taskReservations.data.reservations.length > 0 &&
        taskReservations.data.reservations[taskReservations.data.reservations.length - 1];

      const currentTask = {
        sid: task.sid,
        age: task.age,
        queue: task.task_queue_friendly_name,
        assignment_status: task.assignment_status,
        attributes: JSON.parse(task.attributes),
        workerName: reservation ? reservation.worker_name : 'Não reservado',
        taskReservationSid: reservation && reservation.sid,
      };

      tasks.push(currentTask);
    }

    setTasksByQueue(tasks);

    for (const taskWithAge of tasks) {
      const display = document.querySelector(`#${taskWithAge.sid}`);
      const taskInterval = timer(taskWithAge.age, display);

      listInterval.push(taskInterval);
    }

    setIntervalTasks(listInterval);
    setOnLoading(false);

    return {
      success: true,
      tasks,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errorMessage: error.message,
    };
  }
};
