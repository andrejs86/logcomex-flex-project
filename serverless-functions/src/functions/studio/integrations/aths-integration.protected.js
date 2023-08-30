const axios = require('axios');

exports.handler = async (context, event, callback) => {
  const twilioClient = context.getTwilioClient();

  const { clientNumber, companyNumber, chatServiceSid, channelSid } = event;

  if (!chatServiceSid || !channelSid) {
    return callback(null, {
      success: false,
      message: 'Twilio params required missing',
    });
  }

  if (!clientNumber || !companyNumber) {
    return callback(null, {
      success: false,
      message: 'Company or client number is empty',
    });
  }

  const tokenAuthorization = `${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`;
  const buffer = Buffer.from(tokenAuthorization);
  const tokenAuthorizationFormatted = buffer.toString('base64');

  try {
    const { data } = await axios.get(
      `${context.ATHS_URL_INTEGRATION}?clientNumber=${clientNumber}&companyNumber=${companyNumber}`,
      {
        headers: {
          Authorization: `Bearer ${tokenAuthorizationFormatted}`,
        },
      },
    );

    if (!data.success) throw new Error(data.message);

    const channel = await twilioClient.chat.v2.services(event.chatServiceSid).channels(event.channelSid).fetch();
    const channelAttributes = JSON.parse(channel.attributes);

    if (
      channelAttributes.campaignName &&
      channelAttributes.campaignScheduleDate &&
      channelAttributes.campaignName === data.data?.campaign?.name &&
      channelAttributes.campaignScheduleDate === data.data?.campaign?.schedule_start_date
    ) {
      console.log('Campaign already registered on channel', channel.sid);
      return callback(null, {
        success: false,
        message: 'Campaign already registered',
      });
    }

    await channel.update({
      attributes: JSON.stringify({
        ...channelAttributes,
        campaignName: data.data?.campaign?.name,
        campaignScheduleDate: data.data?.campaign?.schedule_start_date,
      }),
    });

    console.log('ATHS Message Registered on channel', channel.sid);

    return callback(null, { success: true, data: { ...data.data.campaign } });
  } catch (err) {
    return callback(null, { success: false, message: err.message });
  }
};
