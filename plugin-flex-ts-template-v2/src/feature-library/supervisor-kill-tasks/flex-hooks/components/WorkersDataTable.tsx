import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { Actions, ColumnDefinition } from '@twilio/flex-ui';

import { FlexComponent } from '../../../../types/feature-loader';
import KillTaskService from '../../utils/KillTaskService';
import { Container } from './styles.js';

export const componentName = FlexComponent.WorkersDataTable;
export const componentHook = function addKillTasksToWorkersDataTable(flex: typeof Flex, manager: Flex.Manager) {
  const killTaskHandler = async (taskSid: string, conversationSid: string, customerNumber: string) => {
    if (confirm(`Deseja remover essa tarefa do cliente ${customerNumber}?`)) {
      await KillTaskService.KillTask(taskSid, conversationSid);
    }
  };

  if (
    manager.user.roles.find((roles: string) => roles === 'admin') === 'admin' ||
    manager.user.roles.find((roles: string) => roles === 'supervisor') === 'supervisor'
  ) {
    flex.WorkersDataTable.Content.add(
      <ColumnDefinition
        key="button-kill-tasks"
        header={'Remover Tarefa'}
        content={(items: any, _context: any) => {
          return (
            <Container>
              {items.tasks.map((task: any) => (
                <>
                  <button
                    key={task.source.task_sid}
                    className="kill-task"
                    onClick={(event) => {
                      event.stopPropagation();
                      killTaskHandler(
                        task.source.task_sid,
                        task.source.attributes.conversationSid,
                        task.source.attributes.name && task.source.attributes.name.replace('whatsapp:', ''),
                      );
                    }}
                  >
                    {task.source.attributes.name && task.source.attributes.name.replace('whatsapp:', '')} <br />
                    <span>Remover</span>
                  </button>
                </>
              ))}
            </Container>
          );
        }}
      />,
    );
  }
};
