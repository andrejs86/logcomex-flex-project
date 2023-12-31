const { prepareFlexFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);
const ConversationsOperations = require(Runtime.getFunctions()['common/twilio-wrappers/conversations'].path);
const InteractionsOperations = require(Runtime.getFunctions()['common/twilio-wrappers/interactions'].path);
const { logger } = require(Runtime.getFunctions()['common/helpers/logger-helper'].path);

const requiredParameters = [
  {
    key: 'flexInteractionSid',
    purpose: 'KDxxx sid for inteactions API',
  },
  {
    key: 'flexInteractionChannelSid',
    purpose: 'UOxxx sid for interactions API',
  },
  {
    key: 'flexInteractionParticipantSid',
    purpose: 'UTxxx sid for interactions API',
  },
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const { flexInteractionSid, flexInteractionChannelSid, flexInteractionParticipantSid, conversationSid } = event;

    await InteractionsOperations.participantUpdate({
      status: 'closed',
      interactionSid: flexInteractionSid,
      channelSid: flexInteractionChannelSid,
      participantSid: flexInteractionParticipantSid,
      context,
    });
    logger.debug('Participant updated successfully.', { event, context });

    // After leaving, check how many participants are left in the conversation.
    // Why? There is a race condition where the agents may both leave at the same time, so both
    // hit this function rather than taking the normal complete task path. That leaves
    // the interaction open with only one participant--the customer. This is undesirable, because
    // then the customer's next message won't open a new interaction until it is cleaned up in 180 days!
    const participants = await ConversationsOperations.participantList({
      conversationSid,
      limit: 100,
      context,
    });

    if (participants.participants && participants.participants.length <= 1) {
      // No other participants. Check for outstanding invites.
      const conversationResult = await ConversationsOperations.getConversation({
        conversationSid,
        context,
      });
      logger.debug('Conversation with 1 (or less) participants', { event, conversationResult });

      let invites = {};

      if (conversationResult?.conversation?.attributes) {
        const parsedAttrs = JSON.parse(conversationResult.conversation.attributes);

        if (parsedAttrs.invites) {
          invites = parsedAttrs.invites;
        }
      }

      if (Object.keys(invites).length < 1) {
        logger.debug('There are no invites, conversation will be closed.', { event, conversationResult });
        // If the customer is alone, and no invites are pending, close it out.
        await InteractionsOperations.channelUpdate({
          status: 'closed',
          interactionSid: flexInteractionSid,
          channelSid: flexInteractionChannelSid,
          context,
        });
        logger.debug('Conversation closed.', { event, conversationResult });
      } else {
        logger.debug('There are invites, conversation will not be closed.', { event, conversationResult });
      }
    }

    response.setStatusCode(201);
    response.setBody({
      success: true,
    });

    logger.debug('Successfully removed participant.', { event });
    return callback(null, response);
  } catch (error) {
    logger.error('Could not remove participant', { error, event, context });
    return handleError(error);
  }
});
