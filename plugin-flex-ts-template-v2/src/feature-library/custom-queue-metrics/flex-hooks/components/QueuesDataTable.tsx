import * as Flex from '@twilio/flex-ui';

import TasksModal from '../../custom-components/components/TasksModal';

export const componentName = 'QueuesDataTable';
export const componentHook = function replaceQueuesDataTableContent(flex: typeof Flex, _manager: Flex.Manager) {
  flex.QueuesStats.QueuesDataTable.Content.remove('friendly-name');

  flex.QueuesStats.QueuesDataTable.Content.add(
    <Flex.ColumnDefinition
      key="button-agente-details"
      header="Filas"
      content={(items, _context) => <TasksModal items={items} key="custom-modal-tasks-stats" />}
    />,
    { sortOrder: -1 },
  );
};
