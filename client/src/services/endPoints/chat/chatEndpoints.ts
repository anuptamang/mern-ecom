import axios from "axios";
import { BACKEND_API } from "configs/api";
import { getToken } from "utils/localStorage";

export const CHAT_API = `${BACKEND_API}/chat`;

export interface CreateChatPayload {
  recipientId?: string;
  productId?: string;
  initialMessage?: string;
}

/**
 * Create or get existing chat
 */
export const createOrGetChatApi = async (payload: CreateChatPayload) => {
  const token = getToken() || "";
  return axios.post(`${CHAT_API}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Get all chats for current user
 */
export const getMyChatsApi = async () => {
  const token = getToken() || "";
  return axios.get(`${CHAT_API}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Get specific chat by ID
 */
export const getChatByIdApi = async (chatId: string) => {
  const token = getToken() || "";
  return axios.get(`${CHAT_API}/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Send message to chat
 */
export const sendMessageApi = async (chatId: string, text: string) => {
  const token = getToken() || "";
  return axios.post(
    `${CHAT_API}/${chatId}/message`,
    { text },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

/**
 * Mark chat as resolved
 */
export const markChatResolvedApi = async (chatId: string) => {
  const token = getToken() || "";
  return axios.patch(
    `${CHAT_API}/${chatId}/resolve`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

/**
 * Get unread message count
 */
export const getUnreadCountApi = async () => {
  const token = getToken() || "";
  return axios.get(`${CHAT_API}/unread`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

