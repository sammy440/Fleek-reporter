// /lib/localdb.js - Enhanced for full local message storage
import Dexie from "dexie";

export const localDB = new Dexie("fleekReporterLocal");

localDB.version(1).stores({
  privateKeys: "userId",
  convKeys: "conversationId",
  conversations: "id, userId, lastMessageAt", // Store conversations locally
  messages: "id, conversationId, created_at, sender_id", // Store messages locally
  messageQueue: "++id, conversationId, peerId", // Queue for offline messages
});

// Enhanced API for local-first storage
export const localDBApi = {
  // Store conversation locally
  async saveConversation(conversation, userId) {
    try {
      const existing = await localDB.conversations
        .where("id")
        .equals(conversation.id)
        .first();

      if (existing) {
        await localDB.conversations.update(conversation.id, {
          ...conversation,
          lastMessageAt: conversation.lastMessageAt || new Date().toISOString(),
        });
      } else {
        await localDB.conversations.add({
          ...conversation,
          userId,
          lastMessageAt: conversation.lastMessageAt || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error saving conversation locally:", error);
    }
  },

  // Get local conversations for user
  async getConversations(userId) {
    try {
      return await localDB.conversations
        .where("userId")
        .equals(userId)
        .orderBy("lastMessageAt")
        .reverse()
        .toArray();
    } catch (error) {
      console.error("Error getting local conversations:", error);
      return [];
    }
  },

  // Store message locally (encrypted)
  async saveMessage(message, conversationId) {
    try {
      await localDB.messages.add({
        ...message,
        conversationId,
        stored_at: new Date().toISOString(),
      });

      // Update conversation's last message time
      await localDB.conversations.update(conversationId, {
        lastMessageAt: message.created_at || new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving message locally:", error);
    }
  },

  // Get local messages for conversation
  async getMessages(conversationId) {
    try {
      return await localDB.messages
        .where("conversationId")
        .equals(conversationId)
        .orderBy("created_at")
        .toArray();
    } catch (error) {
      console.error("Error getting local messages:", error);
      return [];
    }
  },

  // Queue message for when peer comes online
  async queueMessage(conversationId, peerId, encryptedContent) {
    try {
      await localDB.messageQueue.add({
        conversationId,
        peerId,
        ...encryptedContent,
        queued_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error queuing message:", error);
    }
  },

  // Get queued messages for a peer
  async getQueuedMessages(peerId) {
    try {
      return await localDB.messageQueue
        .where("peerId")
        .equals(peerId)
        .toArray();
    } catch (error) {
      console.error("Error getting queued messages:", error);
      return [];
    }
  },

  // Clear queued messages after delivery
  async clearQueuedMessages(messageIds) {
    try {
      await localDB.messageQueue.bulkDelete(messageIds);
    } catch (error) {
      console.error("Error clearing queued messages:", error);
    }
  },

  // Clear all data for a user (logout)
  async clearUserData(userId) {
    try {
      await localDB.transaction(
        "rw",
        [
          localDB.conversations,
          localDB.messages,
          localDB.privateKeys,
          localDB.convKeys,
          localDB.messageQueue,
        ],
        async () => {
          await localDB.conversations.where("userId").equals(userId).delete();
          await localDB.privateKeys.where("userId").equals(userId).delete();
          // Keep convKeys and messages as they might be needed for other conversations
        }
      );
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  },
};
