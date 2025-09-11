"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Key,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Paperclip,
} from "lucide-react";
import Sidebar from "../../_components/Sidebar";
import { useChatData } from "./hooks/useChatData";
// import { P } from "framer-motion/dist/types.d-Cjd591yU";

export default function ChatsPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState("chats");
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);

  const reporterId = searchParams.get("reporter");
  const reportId = searchParams.get("report");
  const reporterName = searchParams.get("name");
  const conversationId = searchParams.get("conversation");

  const {
    conversations,
    messages,
    loading,
    sendingMessage,
    initializingKeys,
    error,
    getOrCreateConversation,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    resetConversationKeys,
    clearError,
  } = useChatData(session);

  // Calculate total unread messages for sidebar (must be after conversations is initialized)
  const totalUnread = conversations?.reduce(
    (sum, c) => sum + (c.unread_count || 0),
    0
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      const initializeChat = async () => {
        try {
          let conversation = null;
          if (conversationId) {
            setSelectedConversationId(conversationId);
            setShowMobileChat(true);
          } else if (reporterId && reportId && reporterName) {
            conversation = await getOrCreateConversation(reporterId, reportId);
            if (conversation?.id) {
              setSelectedConversationId(conversation.id);
              setShowMobileChat(true);
            }
          }
          if (conversationId || (reporterId && reportId)) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete("conversation");
            newUrl.searchParams.delete("reporter");
            newUrl.searchParams.delete("report");
            newUrl.searchParams.delete("name");
            window.history.replaceState({}, "", newUrl);
          }
        } catch (err) {
          console.error("Failed to initialize chat:", err);
        }
      };
      initializeChat();
    }
  }, [
    conversationId,
    reporterId,
    reportId,
    reporterName,
    session?.user?.id,
    getOrCreateConversation,
  ]);

  useEffect(() => {
    if (!selectedConversationId) return;
    const selectedConv = conversations.find(
      (c) => c.id === selectedConversationId
    );
    if (!selectedConv?.other_participant?.id) return;

    const loadMessages = async () => {
      await fetchMessages(
        selectedConversationId,
        selectedConv.other_participant.id
      );
      await markMessagesAsRead(selectedConversationId);
    };
    loadMessages();
  }, [
    selectedConversationId,
    fetchMessages,
    markMessagesAsRead,
    conversations,
  ]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    const selectedConv = conversations.find(
      (c) => c.id === selectedConversationId
    );
    if (!selectedConv?.other_participant?.id) return;

    const success = await sendMessage(
      selectedConversationId,
      selectedConv.other_participant.id,
      messageInput
    );

    if (success) setMessageInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-300">Loading chats...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        session={session}
        router={router}
        chatUnreadCount={totalUnread}
      />

      <div className="lg:ml-64">
        <div className="w-full max-w-none lg:max-w-6xl lg:mx-auto px-0 sm:px-4 lg:px-6 py-4 lg:py-6">
          <div className="flex h-[calc(100vh-2rem)] max-h-[800px]">
            {/* Chat List Sidebar */}
            <div
              className={`${
                showMobileChat ? "hidden" : "flex"
              } lg:flex w-full lg:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 lg:rounded-l-xl overflow-hidden flex-col`}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Messages
                </h2>
              </div>

              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversationId(conversation.id);
                        setShowMobileChat(true);
                      }}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedConversationId === conversation.id
                          ? "bg-blue-50 dark:bg-blue-900 border-blue-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {conversation.other_participant?.avatar_url ? (
                          <img
                            src={conversation.other_participant.avatar_url}
                            alt={conversation.other_participant?.name || "User"}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {conversation.other_participant?.name
                              ?.charAt(0)
                              ?.toUpperCase() || "A"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {conversation.other_participant?.name ||
                              "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {conversation.last_message_preview}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col items-end space-y-1">
                          <span>
                            {formatMessageTime(conversation.last_message_time)}
                          </span>
                          {conversation.last_message_preview.includes("🔒") && (
                            <Key className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p className="font-medium">No conversations yet</p>
                    <p className="text-sm mt-1">
                      Start chatting from report interactions
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div
              className={`${
                showMobileChat ? "flex" : "hidden"
              } lg:flex flex-1 bg-white dark:bg-gray-800 border-r border-t border-b border-gray-200 dark:border-gray-700 lg:rounded-r-xl flex-col`}
            >
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                    </button>
                    {selectedConversation.other_participant?.avatar_url ? (
                      <img
                        src={selectedConversation.other_participant.avatar_url}
                        alt={
                          selectedConversation.other_participant?.name || "User"
                        }
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center text-white font-semibold text-sm">
                        {selectedConversation.other_participant?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "A"}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {selectedConversation.other_participant?.name ||
                          "Unknown User"}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Report discussion
                        </p>
                        {initializingKeys && (
                          <div className="flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Setting up encryption...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {error &&
                    error.includes("decrypt") &&
                    selectedConversation && (
                      <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900 border-b border-amber-200 dark:border-amber-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Decryption Issues Detected
                            </span>
                          </div>
                          <button
                            onClick={async () => {
                              if (
                                selectedConversationId &&
                                selectedConversation.other_participant?.id
                              ) {
                                const success = await resetConversationKeys(
                                  selectedConversationId,
                                  selectedConversation.other_participant.id
                                );
                                if (success) {
                                  console.log("Keys reset successfully");
                                }
                              }
                            }}
                            disabled={initializingKeys}
                            className="flex items-center space-x-1 px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {initializingKeys ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            <span>Reset Keys</span>
                          </button>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          If messages won&apos;t decrypt, try resetting the
                          encryption keys for this conversation.
                        </p>
                      </div>
                    )}

                  {process.env.NODE_ENV === "development" &&
                    selectedConversation && (
                      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                            Conversation Info
                          </summary>
                          <div className="mt-2 space-y-1 text-gray-500 dark:text-gray-400">
                            <p>Conversation ID: {selectedConversationId}</p>
                            <p>
                              Peer ID:{" "}
                              {selectedConversation.other_participant?.id}
                            </p>
                            <p>Messages: {messages.length} total</p>
                            <p>
                              Encrypted:{" "}
                              {messages.filter((m) => !m.decrypted).length}{" "}
                              messages
                            </p>
                            <p>
                              Keys initializing:{" "}
                              {initializingKeys ? "Yes" : "No"}
                            </p>
                          </div>
                        </details>
                      </div>
                    )}
                  {/* 🔴 Inline error banner inside chat window */}
                  {error && (
                    <div className="px-4 py-2 bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                      <button
                        onClick={clearError}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <Key className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                          Start your secure conversation with{" "}
                          {selectedConversation.other_participant?.name ||
                            "this user"}
                          !
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          🔒 All messages are end-to-end encrypted
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwnMessage =
                          message.sender_id === session.user.id;
                        const isEncrypted =
                          typeof message.content === "string" &&
                          message.content.includes("🔒");

                        return (
                          <div
                            key={message.id}
                            className={`flex items-end space-x-2 ${
                              isOwnMessage ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isOwnMessage &&
                              (selectedConversation.other_participant
                                ?.avatar_url ? (
                                <img
                                  src={
                                    selectedConversation.other_participant
                                      .avatar_url
                                  }
                                  alt={
                                    selectedConversation.other_participant
                                      ?.name || "User"
                                  }
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs">
                                  {(
                                    selectedConversation.other_participant
                                      ?.name || "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              ))}
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? "bg-gray-600 text-white"
                                  : isEncrypted
                                  ? "bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700"
                                  : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                              }`}
                            >
                              {/* File preview logic */}
                              {message.file_url &&
                              message.file_type === "image" ? (
                                <img
                                  src={message.file_url}
                                  alt="Sent image"
                                  className="max-w-full max-h-48 rounded mb-2"
                                />
                              ) : message.file_url &&
                                message.file_type === "video" ? (
                                <video
                                  src={message.file_url}
                                  controls
                                  className="max-w-full max-h-48 rounded mb-2"
                                />
                              ) : message.file_url ? (
                                <a
                                  href={message.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline mb-2 block"
                                >
                                  Download file
                                </a>
                              ) : (
                                <p className="text-sm">{message.content}</p>
                              )}
                              <div className="flex items-center justify-between mt-1">
                                <p
                                  className={`text-xs ${
                                    isOwnMessage
                                      ? "text-blue-100"
                                      : isEncrypted
                                      ? "text-yellow-600 dark:text-yellow-300"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {formatMessageTime(message.created_at)}
                                </p>
                                {isEncrypted && (
                                  <Key className="w-3 h-3 ml-2" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        id="chat-file-input"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !selectedConversationId) return;
                          // Call new sendMessage with file
                          const selectedConv = conversations.find(
                            (c) => c.id === selectedConversationId
                          );
                          if (!selectedConv?.other_participant?.id) return;
                          await sendMessage(
                            selectedConversationId,
                            selectedConv.other_participant.id,
                            "[file]",
                            file
                          );
                          e.target.value = "";
                        }}
                        disabled={sendingMessage || initializingKeys || error}
                      />
                      <button
                        type="button"
                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-100"
                        onClick={() =>
                          document.getElementById("chat-file-input").click()
                        }
                        disabled={sendingMessage || initializingKeys || error}
                        title="Send image or video"
                      >
                        <Paperclip className="w-5 h-5 transform rotate-45" />
                      </button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={`Message ${
                          selectedConversation.other_participant?.name || "user"
                        }...`}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sendingMessage || initializingKeys || error}
                      />
                      <motion.button
                        whileHover={{
                          scale: sendingMessage || initializingKeys ? 1 : 1.05,
                        }}
                        whileTap={{
                          scale: sendingMessage || initializingKeys ? 1 : 0.95,
                        }}
                        onClick={handleSendMessage}
                        disabled={
                          sendingMessage ||
                          initializingKeys ||
                          !messageInput.trim() ||
                          error
                        }
                        className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingMessage ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
                      🔒 End-to-end encrypted
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Key className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-lg font-medium">
                      Welcome to Secure Messages
                    </p>
                    <p className="mt-1">
                      Select a conversation or start a new one from reports
                    </p>
                    <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
                      All conversations are end-to-end encrypted
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
