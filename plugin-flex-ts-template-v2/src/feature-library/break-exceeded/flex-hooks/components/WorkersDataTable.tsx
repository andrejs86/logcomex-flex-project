import * as Flex from '@twilio/flex-ui';
import { ColumnDefinition } from '@twilio/flex-ui';

import { getTimeoutActivities } from '../../config';
import BreakExceeded from '../../custom-components/BreakExceeded/BreakExceeded';
import { FlexComponent } from '../../../../types/feature-loader';
import { Container } from '../../custom-components/BreakExceeded/styles';

export const componentName = FlexComponent.WorkersDataTable;

export const componentHook = function addBreakAlert(flex: typeof Flex, _manager: Flex.Manager) {
  const timeoutSetActivity = getTimeoutActivities();

  flex.WorkersDataTable.Content.add(
    <ColumnDefinition
      key="break-alert"
      header={'Pausa excedida?'}
      content={(items, _context) => {
        const dateUpdated = Date.parse((items as any).worker.source.date_activity_changed);
        const currentDate = new Date().getTime();
        const diffMs = currentDate - dateUpdated;

        const seconds = Math.floor(diffMs / 1000);

        return (
          <>
            {seconds > timeoutSetActivity[(items as any).worker.activityName]?.time ? (
              <Container>
                <BreakExceeded />
                <div className="activity-label" style={{ marginTop: '0.4em', fontSize: 'small' }}>
                  {(items as any).worker.activityName} (
                  {timeoutSetActivity[(items as any).worker.activityName]?.time / 60 === 1
                    ? `${timeoutSetActivity[(items as any).worker.activityName]?.time / 60}  minuto`
                    : `${timeoutSetActivity[(items as any).worker.activityName]?.time / 60}  minutos`}
                  )
                </div>
              </Container>
            ) : (
              <div></div>
            )}
          </>
        );
      }}
    />,
  );
};
