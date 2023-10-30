const { prepareFlexFunction, extractStandardResponse } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);
const TaskOperations = require(Runtime.getFunctions()['common/twilio-wrappers/taskrouter'].path);
const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

const requiredParameters = [
  { key: 'taskSid', purpose: 'sid of the task' },
  { key: 'reservationSid', purpose: 'sid of the specific reservation to update' },
  { key: 'status', purpose: 'status to move the reservation to' },
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  const { taskSid, reservationSid, status: taskStatus } = event;

  try {
    /** on the surface this function only adds a redundant laye
     * around updateReservation but it provides a convenient hook
     * point to introduce custom behaviors on completing reservations
     * that may differ across task types.
     *
     * it is also worth noting that recording a reason is only applicable
     * when completing a task and we can't complete the task without knowing
     * if there are other open resrvations or not.
     *
     * ideally we could record some outcome code in the task attributes but again
     * this gets complex quickly with voice tasks sharing task attributes across
     * reservations and we risk overwriting an outcome of a subsequent transfer
     * reservation.
     **/
    const result = await TaskOperations.updateReservation({
      context,
      taskSid,
      reservationSid,
      status: taskStatus,
    });

    const { status, reservation } = result;

    response.setStatusCode(status);
    response.setBody({ reservation, ...extractStandardResponse(result) });
    logger.info('Reservation updated', { taskSid, reservationSid, taskStatus });
    return callback(null, response);
  } catch (error) {
    logger.error('Could not update reservation', { error, taskSid, reservationSid, taskStatus });
    return handleError(error);
  }
});
