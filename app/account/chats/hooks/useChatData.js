"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSupabaseClientWithAuth } from "../../../_lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";
import { localDB } from "../lib/localdb";
import { localDBApi } from "../lib/localdb";
import * as cryptoLib from "../lib/crypto";

const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const useChatData = (session) => {
  // Add initialization tracking to prevent multiple parallel inits
  const initializationRef = useRef({
    isInitializing: false,
    isInitialized: false,
    initPromise: null,
  });

  // State variables
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [initializingKeys, setInitializingKeys] = useState(false);

  const { supabase: supabaseAuthClient } = useSupabaseClientWithAuth();
  
  // Use authenticated client if we have a valid session and access token
  // Otherwise fall back to browser client
  const client = (session?.user?.accessToken && supabaseAuthClient) 
    ? supabaseAuthClient 
    : supabaseBrowser;
    
  const userId = session?.user?.id;

  // Debug logging for production
  console.log("Chat client debug:", {
    hasSession: !!session,
    hasAccessToken: !!session?.user?.accessToken,
    hasAuthClient: !!supabaseAuthClient,
    usingAuthClient: client === supabaseAuthClient,
    userId
  });

  // --- ENCRYPTION UTILS FOR PRIVATE KEY BACKUP ---
  async function getStableEncryptionKey() {
    const enc = new TextEncoder();
    let secret = "fallback";
    if (session?.user?.id && session?.user?.email) {
      secret = session.user.id + ":" + session.user.email;
    } else if (session?.user?.accessToken || session?.accessToken) {
      secret = session.user?.accessToken || session.accessToken;
    }
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("fleek-reporter-key-backup"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptPrivateKey(privateJwk) {
    const key = await getStableEncryptionKey();
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const data = enc.encode(JSON.stringify(privateJwk));
    const ct = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return {
      iv: Array.from(iv),
      ciphertext: Array.from(new Uint8Array(ct)),
    };
  }

  async function decryptPrivateKey(encrypted) {
    let key;
    try {
      key = await getStableEncryptionKey();
      const iv = new Uint8Array(encrypted.iv);
      const ct = new Uint8Array(encrypted.ciphertext);
      const pt = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ct
      );
      const dec = new TextDecoder();
      return JSON.parse(dec.decode(pt));
    } catch (e) {
      console.error("Failed to decrypt private key", e);
      return null;
    }
  }

  async function backupPrivateKeyToSupabase(userId, privateJwk) {
    const encrypted = await encryptPrivateKey(privateJwk);
    await client
      .from("profiles")
      .update({ encrypted_private_key: encrypted })
      .eq("id", userId);
  }

  async function restorePrivateKeyFromSupabase(userId) {
    const { data: profile } = await client
      .from("profiles")
      .select("encrypted_private_key")
      .eq("id", userId)
      .single();
    if (profile?.encrypted_private_key) {
      try {
        return await decryptPrivateKey(profile.encrypted_private_key);
      } catch (e) {
        console.error("Failed to decrypt private key from Supabase", e);
        return null;
      }
    }
    return null;
  }

  // Helper function to verify key pair compatibility
  const verifyKeyPairCompatibility = async (publicJwk, privateJwk) => {
    try {
      const testMessage = "key_compatibility_test";
      const { aesKey } = await cryptoLib.deriveConversationKey(
        privateJwk,
        publicJwk,
        null
      );
      const { ivBase64, ciphertextBase64 } = await cryptoLib.encryptWithAesGcm(
        aesKey,
        testMessage
      );
      const decrypted = await cryptoLib.decryptWithAesGcm(
        aesKey,
        ivBase64,
        ciphertextBase64
      );
      return decrypted === testMessage;
    } catch (error) {
      console.error("Key compatibility verification failed:", error);
      return false;
    }
  };

  // Initialize keys - MEMOIZED to prevent excessive calls
  const initializeUserKeys = useCallback(
    async (targetUserId) => {
      if (targetUserId !== userId) return null;

      try {
        setInitializingKeys(true);

        const [profileResult, localPrivateKey, restoredPrivateKey] =
          await Promise.all([
            client
              .from("profiles")
              .select("public_key_jwk, encrypted_private_key")
              .eq("id", targetUserId)
              .single(),
            localDB.privateKeys.get(targetUserId),
            restorePrivateKeyFromSupabase(targetUserId),
          ]);

        const { data: profile } = profileResult;
        const hasPublicKey = profile?.public_key_jwk;
        const hasPrivateKey = localPrivateKey?.privateJwk;
        const hasBackupKey = !!restoredPrivateKey;

        if (hasPublicKey && hasPrivateKey) {
          const isCompatible = await verifyKeyPairCompatibility(
            profile.public_key_jwk,
            localPrivateKey.privateJwk
          );
          if (isCompatible) {
            return profile.public_key_jwk;
          } else {
            await localDB.privateKeys.delete(targetUserId);
            await client
              .from("profiles")
              .update({ public_key_jwk: null })
              .eq("id", targetUserId);
          }
        }

        if (hasPublicKey && !hasPrivateKey && !hasBackupKey) {
          await client
            .from("profiles")
            .update({ public_key_jwk: null })
            .eq("id", targetUserId);
        }

        if (!hasPublicKey && hasPrivateKey && !hasBackupKey) {
          await localDB.privateKeys.delete(targetUserId);
        }

        if (hasBackupKey) {
          await localDB.privateKeys.put({
            userId: targetUserId,
            privateJwk: restoredPrivateKey,
          });
          if (!hasPublicKey) {
            const { publicJwk } = await cryptoLib.generateIdentityKeyPair();
            await client
              .from("profiles")
              .update({ public_key_jwk: publicJwk })
              .eq("id", targetUserId);
          }
          return profile?.public_key_jwk || null;
        }

        const { publicJwk, privateJwk } =
          await cryptoLib.generateIdentityKeyPair();
        const newKeysCompatible = await verifyKeyPairCompatibility(
          publicJwk,
          privateJwk
        );
        if (!newKeysCompatible)
          throw new Error("Generated keys are not compatible");

        const [updateResult] = await Promise.all([
          client
            .from("profiles")
            .upsert({
              id: targetUserId,
              public_key_jwk: publicJwk,
              updated_at: new Date().toISOString(),
            })
            .eq("id", targetUserId),
          localDB.privateKeys.put({ userId: targetUserId, privateJwk }),
          backupPrivateKeyToSupabase(targetUserId, privateJwk),
        ]);

        if (updateResult.error) {
          await localDB.privateKeys.delete(targetUserId);
          throw updateResult.error;
        }
        return publicJwk;
      } catch (error) {
        console.error(
          `Error initializing keys for user ${targetUserId}:`,
          error
        );
        try {
          await localDB.privateKeys.delete(targetUserId);
          await client
            .from("profiles")
            .update({ public_key_jwk: null })
            .eq("id", targetUserId);
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
        }
        throw error;
      } finally {
        setInitializingKeys(false);
      }
    },
    [userId, client] // Stable dependencies only
  );

  // OPTIMIZED ensure identity keys - prevents multiple parallel calls
  const ensureIdentityKeys = useCallback(async () => {
    if (!userId) return null;

    // Prevent parallel initialization
    if (initializationRef.current.isInitializing) {
      return initializationRef.current.initPromise;
    }

    if (initializationRef.current.isInitialized) {
      const localKey = await localDB.privateKeys.get(userId);
      return localKey?.privateJwk || null;
    }

    initializationRef.current.isInitializing = true;

    const initPromise = (async () => {
      try {
        // Try with current client first
        let profileResult = await client
          .from("profiles")
          .select("public_key_jwk")
          .eq("id", userId)
          .single();

        // If we get an auth error, try with browser client as fallback
        if (profileResult.error && profileResult.error.code === 'PGRST301' && client !== supabaseBrowser) {
          console.log("Auth error in ensureIdentityKeys, trying with browser client...");
          profileResult = await supabaseBrowser
            .from("profiles")
            .select("public_key_jwk")
            .eq("id", userId)
            .single();
        }

        const localPrivateKey = await localDB.privateKeys.get(userId);
        const { data: profile } = profileResult;

        if (profile?.public_key_jwk && localPrivateKey?.privateJwk) {
          const isCompatible = await verifyKeyPairCompatibility(
            profile.public_key_jwk,
            localPrivateKey.privateJwk
          );

          if (isCompatible) {
            initializationRef.current.isInitialized = true;
            return localPrivateKey.privateJwk;
          }
        }

        await initializeUserKeys(userId);
        const updated = await localDB.privateKeys.get(userId);
        initializationRef.current.isInitialized = true;
        return updated?.privateJwk || null;
      } catch (error) {
        console.error("Error ensuring identity keys:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
          userId
        });
        setError(
          `Failed to setup encryption keys: ${error.message}. Please try logging out and back in.`
        );
        return null;
      } finally {
        initializationRef.current.isInitializing = false;
      }
    })();

    initializationRef.current.initPromise = initPromise;
    return initPromise;
  }, [userId, client, initializeUserKeys]);

  // Get peer's public key - CACHED to prevent repeated requests
  const peerKeyCache = useRef(new Map());
  const getPeerPublicKey = useCallback(
    async (peerId, maxRetries = 2, delay = 1000) => {
      // Check cache first
      if (peerKeyCache.current.has(peerId)) {
        return peerKeyCache.current.get(peerId);
      }

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const { data: peerProfile, error } = await client
            .from("profiles")
            .select("public_key_jwk")
            .eq("id", peerId)
            .single();

          if (error) {
            if (error.code === "PGRST116") {
              throw new Error(
                `User ${peerId} has not set up their encryption keys yet.`
              );
            }
            throw error;
          }

          if (peerProfile?.public_key_jwk) {
            // Cache the result
            peerKeyCache.current.set(peerId, peerProfile.public_key_jwk);
            return peerProfile.public_key_jwk;
          }

          if (attempt < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (error) {
          if (attempt === maxRetries - 1) throw error;
          console.error(
            `Error getting peer keys (attempt ${attempt + 1}):`,
            error
          );
        }
      }

      throw new Error(`Unable to get encryption keys for user ${peerId}.`);
    },
    [client]
  );

  // OPTIMIZED get conversation AES key - with caching
  const conversationKeyCache = useRef(new Map());
  const getConversationAesKey = useCallback(
    async (conversationId, peerId) => {
      const cacheKey = `${conversationId}-${peerId}`;

      // Return cached key if available
      if (conversationKeyCache.current.has(cacheKey)) {
        return conversationKeyCache.current.get(cacheKey);
      }

      try {
        const privateJwk = await ensureIdentityKeys();
        if (!privateJwk) {
          throw new Error("Unable to get your private key");
        }

        setInitializingKeys(true);
        const peerPublicKey = await getPeerPublicKey(peerId);

        let saltBase64 = null;
        const cachedKey = await localDB.convKeys.get(conversationId);
        saltBase64 = cachedKey?.saltBase64;

        if (!saltBase64) {
          const { data: convRow, error: convError } = await client
            .from("conversations")
            .select("salt_base64")
            .eq("id", conversationId)
            .single();

          if (convError) throw convError;
          saltBase64 = convRow?.salt_base64;
        }

        const { aesKey, saltBase64: newSalt } =
          await cryptoLib.deriveConversationKey(
            privateJwk,
            peerPublicKey,
            saltBase64
          );

        if (!saltBase64) {
          await client
            .from("conversations")
            .update({ salt_base64: newSalt })
            .eq("id", conversationId);

          await localDB.convKeys.put({ conversationId, saltBase64: newSalt });
        } else if (!cachedKey) {
          await localDB.convKeys.put({ conversationId, saltBase64 });
        }

        // Cache the derived key
        conversationKeyCache.current.set(cacheKey, aesKey);
        return aesKey;
      } catch (error) {
        console.error("Error getting conversation AES key:", error);

        if (error.message.includes("has not set up their encryption keys")) {
          setError(`${error.message} Ask them to log in and refresh.`);
        } else {
          setError(`Encryption error: ${error.message}`);
        }
        throw error;
      } finally {
        setInitializingKeys(false);
      }
    },
    [ensureIdentityKeys, client, getPeerPublicKey]
  );

  // Get or create conversation
  const getOrCreateConversation = useCallback(
    async (otherUserId, reportId = null) => {
      if (!userId || !otherUserId) return null;

      try {
        await ensureIdentityKeys();

        // Try with the current client first
        let { data: existingList, error: fetchError } = await client
          .from("conversations")
          .select("*")
          .or(
            `and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`
          )
          .limit(1);

        // If we get an auth error, try with browser client as fallback
        if (fetchError && fetchError.code === 'PGRST301' && client !== supabaseBrowser) {
          console.log("Auth error detected, trying with browser client...");
          const fallbackResult = await supabaseBrowser
            .from("conversations")
            .select("*")
            .or(
              `and(participant_1.eq.${userId},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${userId})`
            )
            .limit(1);
          existingList = fallbackResult.data;
          fetchError = fallbackResult.error;
        }

        if (fetchError) throw fetchError;
        if (existingList?.length) return existingList[0];

        // Try to create conversation with current client
        let { data: created, error: createError } = await client
          .from("conversations")
          .insert({
            participant_1: userId,
            participant_2: otherUserId,
            report_id: reportId || null,
            last_message_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        // If we get an auth error, try with browser client as fallback
        if (createError && createError.code === 'PGRST301' && client !== supabaseBrowser) {
          console.log("Auth error on create, trying with browser client...");
          const fallbackResult = await supabaseBrowser
            .from("conversations")
            .insert({
              participant_1: userId,
              participant_2: otherUserId,
              report_id: reportId || null,
              last_message_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            })
            .select("*")
            .single();
          created = fallbackResult.data;
          createError = fallbackResult.error;
        }

        if (createError) throw createError;
        return created;
      } catch (err) {
        console.error("Error in getOrCreateConversation:", err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
          name: err.name,
          userId,
          otherUserId,
          reportId
        });
        setError(`Failed to create conversation: ${err.message}`);
        return null;
      }
    },
    [userId, client, ensureIdentityKeys, supabaseBrowser]
  );

  // Reset conversation keys
  const resetConversationKeys = useCallback(
    async (conversationId, peerId) => {
      try {
        setInitializingKeys(true);
        setError(null);

        // Clear caches
        const cacheKey = `${conversationId}-${peerId}`;
        conversationKeyCache.current.delete(cacheKey);
        await localDB.convKeys.delete(conversationId);

        await client
          .from("conversations")
          .update({ salt_base64: null })
          .eq("id", conversationId);

        const aesKey = await getConversationAesKey(conversationId, peerId);
        await fetchMessages(conversationId, peerId);

        return true;
      } catch (error) {
        console.error("Error resetting conversation keys:", error);
        setError("Failed to reset keys.");
        return false;
      } finally {
        setInitializingKeys(false);
      }
    },
    [client, getConversationAesKey]
  );

  // OPTIMIZED send message
  const sendMessage = useCallback(
    async (
      conversationId,
      peerId,
      content,
      file = null,
      messageType = "text"
    ) => {
      if (!userId || !conversationId || !peerId || (!content?.trim() && !file))
        return false;

      setSendingMessage(true);
      setError(null);

      try {
        let finalContent = content?.trim() || "";
        let fileUrl = null;
        let fileType = null;

        if (file) {
          const ext = file.name.split(".").pop();
          const fileName = `${userId}_${Date.now()}.${ext}`;
          const bucket = "chat-files";
          const uploadRes = await client.storage
            .from(bucket)
            .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });
          if (uploadRes.error) throw uploadRes.error;

          const { data: signedUrlData, error: signedUrlError } =
            await client.storage
              .from(bucket)
              .createSignedUrl(fileName, 60 * 60);
          if (signedUrlError) throw signedUrlError;
          fileUrl = signedUrlData?.signedUrl;
          fileType = file.type.startsWith("image")
            ? "image"
            : file.type.startsWith("video")
            ? "video"
            : "file";
          finalContent = `[${fileType}]:${fileUrl}`;
          messageType = fileType;
        }

        const aesKey = await getConversationAesKey(conversationId, peerId);
        const { ivBase64, ciphertextBase64 } =
          await cryptoLib.encryptWithAesGcm(aesKey, finalContent);

        const { data, error } = await client
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id: userId,
            iv_base64: ivBase64,
            ciphertext_base64: ciphertextBase64,
            message_type: messageType,
            file_url: fileUrl,
            file_type: fileType,
            created_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        if (error) throw error;

        const newMessage = {
          ...data,
          content: finalContent,
          decrypted: true,
        };

        setMessages((prev) => [...prev, newMessage]);

        await client
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", conversationId);

        return true;
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message. Please try again.");
        return false;
      } finally {
        setSendingMessage(false);
      }
    },
    [userId, client, getConversationAesKey]
  );

  // OPTIMIZED fetch conversations - single query with proper joins
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      await ensureIdentityKeys();
      const { data, error } = await client
        .from("conversations")
        .select(
          `
    id,
    participant_1,
    participant_2,
    last_message_at,
    created_at,
    participant_1_profile:profiles!conversations_participant_1_fkey(id, name, avatar_url),
    participant_2_profile:profiles!conversations_participant_2_fkey(id, name, avatar_url),
    messages(count)
  `
        )
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const processed = (data || []).map((conv) => {
        const isParticipant1 = conv.participant_1 === userId;
        const otherParticipant = isParticipant1
          ? conv.participant_2_profile
          : conv.participant_1_profile;

        return {
          ...conv,
          other_participant: otherParticipant,
          last_message_preview: "🔒 Encrypted message",
          last_message_time: conv.last_message_at || conv.created_at,
          unread_count: 0,
        };
      });

      setConversations(processed);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [userId, client, ensureIdentityKeys]);

  // OPTIMIZED fetch messages
  const fetchMessages = useCallback(
    async (conversationId, peerId) => {
      if (!conversationId || !peerId) return;

      try {
        setError(null);

        const { data, error } = await client
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          setMessages([]);
          return;
        }

        const aesKey = await getConversationAesKey(conversationId, peerId);
        const decryptedMessages = [];

        for (const msg of data) {
          try {
            const plaintext = await cryptoLib.decryptWithAesGcm(
              aesKey,
              msg.iv_base64,
              msg.ciphertext_base64
            );
            decryptedMessages.push({
              ...msg,
              content: plaintext,
              decrypted: true,
            });
          } catch (decryptError) {
            console.error(`Failed to decrypt message ${msg.id}:`, decryptError);
            decryptedMessages.push({
              ...msg,
              content: "🔒 [Could not decrypt this message]",
              decrypted: false,
            });
          }
        }

        setMessages(decryptedMessages);

        const failedCount = decryptedMessages.filter(
          (m) => !m.decrypted
        ).length;
        if (failedCount > 0) {
          setError(
            `${failedCount} message(s) could not be decrypted. Try resetting conversation keys.`
          );
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
        setMessages([]);
      }
    },
    [client, getConversationAesKey]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (conversationId) => {
      if (!userId || !conversationId) return;
      try {
        await client
          .from("messages")
          .update({ read_by_recipient: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", userId);
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    },
    [userId, client]
  );

  // SINGLE initialization effect with proper cleanup
  useEffect(() => {
    if (!userId || initializationRef.current.isInitialized) return;

    const initializeOnce = async () => {
      try {
        await ensureIdentityKeys();
        await fetchConversations();
      } catch (err) {
        console.error("Initialization failed:", err);
        setError("Failed to initialize encryption. Please refresh the page.");
      }
    };

    initializeOnce();
  }, [userId]); // Only depend on userId

  // Real-time subscriptions with proper cleanup
  useEffect(() => {
    if (!userId) return;

    const messagesSub = client
      .channel("user-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          try {
            const newMessage = payload.new;
            // Skip if it's your own message (already added in sendMessage)
            if (newMessage.sender_id === userId) return;

            const aesKey = await getConversationAesKey(
              newMessage.conversation_id,
              newMessage.sender_id
            );

            let decryptedContent;
            try {
              decryptedContent = await cryptoLib.decryptWithAesGcm(
                aesKey,
                newMessage.iv_base64,
                newMessage.ciphertext_base64
              );
            } catch {
              decryptedContent = "🔒 [Could not decrypt this message]";
            }

            setMessages((prev) => {
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [
                ...prev,
                { ...newMessage, content: decryptedContent, decrypted: true },
              ];
            });
          } catch (err) {
            console.error("Error processing real-time message:", err);
          }
        }
      )

      .subscribe();

    return () => {
      client.removeChannel(messagesSub);
    };
  }, [userId, client]);

  return {
    conversations,
    messages,
    loading,
    sendingMessage,
    initializingKeys,
    error,
    getOrCreateConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    resetConversationKeys,
    clearError: () => setError(null),
  };
};
