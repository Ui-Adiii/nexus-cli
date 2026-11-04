import { db } from "../lib/db.js";

const conversation = db.collection("conversation");
const message = db.collection("message");

export const Conversation = {
  create: async (data) => {
    const now = new Date();

    const doc = {
      id: crypto.randomUUID(),
      userId: data.userId,
      title: data.title ?? null,
      mode: data.mode ?? "chat",
      createdAt: now,
      updatedAt: now,
    };

    await conversation.insertOne(doc);
    return doc;
  },

  findByUser: (userId) => conversation.find({ userId }).toArray(),

  findById: (id) => conversation.findOne({ id }),

  update: (id, data) =>
    conversation.findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: "after" },
    ),

  delete: (id) => conversation.deleteOne({ id }),

  deleteByUser: async (id, userId) => {
    const result = await conversation.deleteOne({ id, userId });

    if (result.deletedCount) {
      await message.deleteMany({ conversationId: id });
    }

    return result;
  },
};

export const Message = {
  create: async (data) => {
    const doc = {
      id: crypto.randomUUID(),
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      createdAt: new Date(),
    };

    await message.insertOne(doc);
    return doc;
  },

  findByConversation: (conversationId) =>
    message.find({ conversationId }).sort({ createdAt: 1 }).toArray(),

  deleteByConversation: (conversationId) =>
    message.deleteMany({ conversationId }),
};
