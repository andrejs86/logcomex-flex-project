import * as Flex from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { FlexComponent } from '../../../../types/feature-loader';
import TasksTile from '../../custom-components/components/TasksTile';
import { OnAttendance, OnFinish, WaitingOnAgent, WaitingOnQueue } from '../../assets/svg-icons';

export const componentName = FlexComponent.QueueStats;
export const componentHook = function replaceAggregatedQueuesDataTiles(flex: typeof Flex, _manager: Flex.Manager) {
  const wtt_mapStateToProps = connect((state: any) => {
    const queues = Object.values(state.flex.realtimeQueues.queuesList);
    const filteredQueues = queues.filter(
      (q) => (q as any).friendly_name !== 'Tracker' && (q as any).friendly_name !== 'Survey',
    );

    const result: { waitingTasks: number } = { waitingTasks: 0 };
    result.waitingTasks =
      Number(filteredQueues.reduce((sum, q) => Number(sum) + Number((q as any).tasks_by_status.pending), 0)) +
      Number(filteredQueues.reduce((sum, q) => Number(sum) + Number((q as any).tasks_by_status.reserved), 0));

    return result;
  });

  const WaitingTaskTile = wtt_mapStateToProps((props: any) => (
    <TasksTile
      tasks={props.waitingTasks}
      firstStatus={'pending'}
      secondStatus={'reserved'}
      firstTitle={'Tarefas em espera na fila'}
      secondTitle={'Tarefas em espera no agente'}
      name={'Em espera'}
      id={'modalWaitingTasksTile'}
      firstIcon={WaitingOnQueue}
      secondIcon={WaitingOnAgent}
    />
  ));

  flex.QueuesStats.AggregatedQueuesDataTiles.Content.remove('waiting-tasks-tile');

  flex.QueuesStats.AggregatedQueuesDataTiles.Content.add(<WaitingTaskTile key="custom-waiting-tasks-tile" />, {
    sortOrder: 1,
  });

  const att_mapStateToProps = (state: any) => {
    const queues = Object.values(state.flex.realtimeQueues.queuesList);
    const filteredQueues = queues.filter(
      (queue) => (queue as any).friendly_name !== 'Tracker' && (queue as any).friendly_name !== 'Survey',
    );

    const result: { activeTasks: number } = { activeTasks: 0 };
    result.activeTasks =
      Number(filteredQueues.reduce((sum, q) => Number(sum) + Number((q as any).tasks_by_status.assigned), 0)) +
      Number(filteredQueues.reduce((sum, q) => Number(sum) + Number((q as any).tasks_by_status.wrapping), 0));
    return result;
  };
  const att_connect = connect(att_mapStateToProps);
  const ActiveTaskTile = att_connect((props: any) => {
    return (
      <TasksTile
        tasks={props.activeTasks}
        firstStatus={'assigned'}
        secondStatus={'wrapping'}
        firstTitle={'Tarefas em atendimento'}
        secondTitle={'Tarefas aguardando finalização'}
        name={'Ativas'}
        id={'modalActiveTasksTile'}
        firstIcon={OnAttendance}
        secondIcon={OnFinish}
      />
    );
  });

  flex.QueuesStats.AggregatedQueuesDataTiles.Content.remove('active-tasks-tile');

  flex.QueuesStats.AggregatedQueuesDataTiles.Content.add(<ActiveTaskTile key="custom-active-tasks-tile" />, {
    sortOrder: 0,
  });
};
