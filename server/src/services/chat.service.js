import { Conversation, Message } from "../models/index.js";

export class ChatService {
  async createConversation(userId, mode = "chat", title = null) {
    return Conversation.create({
      userId,
      mode,
      title: title || `New ${mode} conversation`,
    });
  }

  async getOrCreateConversation(userId, conversationId = null, mode = "chat") {
    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);

      if (conversation?.userId === userId) {
        const messages = await Message.findByConversation(conversationId);
        return { ...conversation, messages };
      }
    }

    return this.createConversation(userId, mode);
  }

  async addMessage(conversationId, role, content) {
    const contentStr =
      typeof content === "string" ? content : JSON.stringify(content);
    const result = await Message.create({
      conversationId,
      role,
      content: contentStr,
    });

    await Conversation.update(conversationId, {
      updatedAt: new Date(),
    });

    return result;
  }

  async deleteConversation(conversationId) {
    await Message.deleteByConversation(conversationId);
  }
  async getMessages(conversationId) {
    const messages = await Message.findByConversation(conversationId);

    return messages.map((msg) => ({
      ...msg,
      content: this.parseContent(msg.content),
    }));
  }

  async getUserConversations(userId) {
    const conversations = await Conversation.findByUser(userId);

    return Promise.all(
      conversations
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(async (conversation) => {
          const messages = await Message.findByConversation(conversation.id);

          return {
            ...conversation,
            messages: messages.slice(-1),
          };
        }),
    );
  }

  async deleteConversation(conversationId, userId) {
    return Conversation.deleteByUser(conversationId, userId);
  }

  async updateTitle(conversationId, title) {
    return Conversation.update(conversationId, {
      title,
      updatedAt: new Date(),
    });
  }

  parseContent(content) {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }

  formatMessagesForAI(messages) {
    return messages.map((msg) => ({
      role: msg.role,
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));
  }
}
