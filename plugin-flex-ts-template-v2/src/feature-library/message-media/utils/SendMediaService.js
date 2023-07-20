class SendMediaService {
  constructor(manager) {
    this.manager = manager;
  }

  async sendMedia(file, conversationSid) {
    try {
      const channel = await this.manager.conversationsClient.getConversationBySid(conversationSid);
      await channel.sendMessage({
        contentType: file.type,
        media: file,
      });
    } catch (err) {
      console.error('Error while sending media', err);
    }
  }
}

export default SendMediaService;
