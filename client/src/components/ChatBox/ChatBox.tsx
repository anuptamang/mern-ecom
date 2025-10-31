import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Card, Avatar, Badge, Spin, Empty, message as antMessage, List, Typography } from 'antd';
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  MinusOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import {
  createOrGetChatApi,
  getChatByIdApi,
  sendMessageApi,
  getMyChatsApi,
} from 'services/endPoints/chat/chatEndpoints';
import { useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import './ChatBox.scss';

interface Message {
  _id?: string;
  senderId: {
    _id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
  };
  senderRole: string;
  text: string;
  productInfo?: {
    productId: string;
    productTitle: string;
    productThumbnail: string;
    productPrice: number;
    productSlug: string;
  };
  createdAt: string;
  read: boolean;
  readAt?: string;
  seenAt?: string;
  seenBy?: { [key: string]: string };
}

interface Chat {
  _id: string;
  participants: Array<{
    userId: {
      _id: string;
      fullName: string;
      email: string;
      profilePhoto?: string;
      role: string;
    };
    role: string;
  }>;
  messages: Message[];
  productContext?: {
    productId: string;
    productTitle: string;
    productThumbnail: string;
    productPrice: number;
    productSlug: string;
  };
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: string;
  };
  unreadCount?: number | { [key: string]: number };
  status: string;
}

interface ChatBoxProps {
  productId?: string;
  productTitle?: string;
  productThumbnail?: string;
  productPrice?: number;
  productSlug?: string;
  sellerId?: string;
  chatId?: string; // For opening existing chat
  onClose?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  productId,
  productTitle,
  productThumbnail,
  productPrice,
  productSlug,
  sellerId,
  chatId,
  onClose,
}) => {
  const { result: user } = useAppSelector(authSelector);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef<string | null>(null);

  const { Text } = Typography;

  // Load all chats when ChatBox opens
  useEffect(() => {
    if (isOpen && user) {
      loadAllChats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  // Auto-open if productId or chatId is provided
  useEffect(() => {
    if (chatId && user) {
      // Load existing chat
      loadChatMessages(chatId);
      chatIdRef.current = chatId;
      setIsOpen(true);
      setIsMinimized(false);
    } else if (productId && sellerId && user) {
      handleOpenChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, sellerId, chatId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chat && isOpen && !isMinimized) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?.messages, isOpen, isMinimized]);

  const handleOpenChat = async () => {
    if (!user) {
      antMessage.warning('Please login to start chatting');
      return;
    }

    if (!sellerId && !productId) {
      antMessage.error('No recipient or product specified');
      return;
    }

    setIsOpen(true);
    setIsMinimized(false);
    setLoading(true);

    try {
      const payload: any = {};
      if (productId) {
        payload.productId = productId;
      }
      if (sellerId) {
        payload.recipientId = sellerId;
      }

      const response = await createOrGetChatApi(payload);
      const newChat = response.data.chat;
      setChat(newChat);
      chatIdRef.current = newChat._id;

      // Load messages if chat exists
      if (newChat._id) {
        await loadChatMessages(newChat._id);
        // Reload chats list to include new chat
        await loadAllChats();
      }
    } catch (error: any) {
      console.error('Error opening chat:', error);
      antMessage.error(error.response?.data?.message || 'Failed to open chat');
    } finally {
      setLoading(false);
    }
  };

  const loadAllChats = async () => {
    try {
      setChatsLoading(true);
      const response = await getMyChatsApi();
      setChats(response.data.chats || []);
    } catch (error: any) {
      console.error('Error loading chats:', error);
    } finally {
      setChatsLoading(false);
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      setLoading(true);
      const response = await getChatByIdApi(chatId);
      const loadedChat = response.data.chat;
      setChat(loadedChat);
      chatIdRef.current = chatId;
      
      // Update chat in chats list and refresh unread counts
      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c._id === chatId) {
            // Update with new chat data including reset unread count
            return loadedChat;
          }
          return c;
        })
      );
      
      // Reload chats list to get updated unread counts
      await loadAllChats();
    } catch (error: any) {
      console.error('Error loading chat messages:', error);
      antMessage.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (selectedChatId: string) => {
    if (selectedChatId !== chatIdRef.current) {
      loadChatMessages(selectedChatId);
    }
  };

  const getOtherParticipantFromChat = (chatItem: Chat) => {
    return chatItem.participants.find((p) => String(p.userId._id) !== String(user?._id));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    const currentChatId = chatIdRef.current;
    if (!currentChatId) {
      // Create chat first if it doesn't exist
      await handleOpenChat();
      return;
    }

    setSending(true);
    const textToSend = messageText.trim();
    setMessageText('');

      try {
      const response = await sendMessageApi(currentChatId, textToSend);
      // Ensure we have the updated chat with new message
      const updatedChat = response.data.chat;
      setChat(updatedChat);
      
      // Update chat in chats list
      setChats((prevChats) =>
        prevChats.map((c) => (c._id === currentChatId ? updatedChat : c))
      );
      
      // Reload chat messages to ensure persistence
      setTimeout(() => {
        loadChatMessages(currentChatId);
      }, 100);
      
      scrollToBottom();
    } catch (error: any) {
      console.error('Error sending message:', error);
      antMessage.error(error.response?.data?.message || 'Failed to send message');
      setMessageText(textToSend); // Restore message text on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherParticipant = () => {
    if (!chat) return null;
    return chat.participants.find((p) => String(p.userId._id) !== String(user?._id));
  };

  const otherParticipant = getOtherParticipant();

  if (!isOpen) {
    return (
      <div className="chat-box-toggle">
        <Badge dot>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={handleOpenChat}
            className="chat-toggle-button"
          />
        </Badge>
      </div>
    );
  }

  return (
    <div className={`chat-box-container ${isMinimized ? 'minimized' : ''} ${showSidebar ? 'with-sidebar' : ''}`}>
      <div className="chat-box-wrapper">
        {/* Sidebar */}
        {showSidebar && !isMinimized && (
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <Text strong>Messages</Text>
              <Button
                type="text"
                icon={<CloseOutlined />}
                size="small"
                onClick={() => setShowSidebar(false)}
              />
            </div>
            <div className="chat-sidebar-content">
              {chatsLoading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <Spin />
                </div>
              ) : chats.length === 0 ? (
                <Empty
                  description="No conversations"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ padding: '20px 0' }}
                />
              ) : (
                <List
                  dataSource={chats}
                  renderItem={(chatItem) => {
                    const otherParticipant = getOtherParticipantFromChat(chatItem);
                    if (!otherParticipant) return null;
                    
                    const isActive = chatItem._id === chatIdRef.current;
                    // unreadCount is a Map/object: { userId: count }
                    // Extract count for current user
                    const unreadCountMap = chatItem.unreadCount || {};
                    let unreadCount = 0;
                    if (typeof unreadCountMap === 'number') {
                      unreadCount = unreadCountMap;
                    } else if (typeof unreadCountMap === 'object' && unreadCountMap !== null && user?._id) {
                      const userId = user._id;
                      unreadCount = (unreadCountMap as { [key: string]: number })[userId] 
                        || (unreadCountMap as { [key: string]: number })[String(userId)] 
                        || 0;
                    }
                    
                    return (
                      <List.Item
                        className={`chat-sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleChatSelect(chatItem._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge count={unreadCount} offset={[-5, 5]}>
                              <Avatar
                                src={otherParticipant.userId.profilePhoto}
                                icon={<UserOutlined />}
                                size="default"
                              />
                            </Badge>
                          }
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong={!isActive} style={{ fontSize: 14 }}>
                                {otherParticipant.userId.fullName || 'Unknown'}
                              </Text>
                              {chatItem.lastMessage?.timestamp && (
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {new Date(chatItem.lastMessage.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </Text>
                              )}
                            </div>
                          }
                          description={
                            <div>
                              {chatItem.productContext && (
                                <Text type="secondary" ellipsis style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                                  {chatItem.productContext.productTitle}
                                </Text>
                              )}
                              {chatItem.lastMessage && (
                                <Text
                                  ellipsis
                                  style={{
                                    fontSize: 12,
                                    color: unreadCount > 0 && !isActive ? '#1890ff' : '#666',
                                    fontWeight: unreadCount > 0 && !isActive ? 500 : 400,
                                  }}
                                >
                                  {chatItem.lastMessage.text}
                                </Text>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <Card
          className="chat-box-card"
          title={
            <div className="chat-header">
              {!showSidebar && (
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setShowSidebar(true)}
                  style={{ marginRight: 8 }}
                />
              )}
              <div className="chat-header-info">
                <Avatar
                  src={otherParticipant?.userId.profilePhoto}
                  icon={<UserOutlined />}
                  size="small"
                />
                <span className="chat-participant-name">
                  {otherParticipant?.userId.fullName || 'Chat'}
                </span>
              </div>
              <div className="chat-header-actions">
                <Button
                  type="text"
                  icon={<MinusOutlined />}
                  onClick={() => setIsMinimized(!isMinimized)}
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                />
              </div>
            </div>
          }
        >
        {isMinimized ? (
          <div className="chat-minimized-content">
            <span>Chat minimized</span>
          </div>
        ) : (
          <>
            {/* Product Context Display */}
            {chat?.productContext && (
              <div className="chat-product-context">
                <div className="product-card-mini">
                  {chat.productContext.productThumbnail ? (
                    <img
                      src={chat.productContext.productThumbnail}
                      alt={chat.productContext.productTitle}
                      className="product-thumbnail"
                    />
                  ) : (
                    <div className="product-placeholder">No Image</div>
                  )}
                  <div className="product-info-mini">
                    <div className="product-title-mini">{chat.productContext.productTitle}</div>
                    <div className="product-price-mini">${chat.productContext.productPrice?.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages List */}
            <div className="chat-messages">
              {loading ? (
                <div className="chat-loading">
                  <Spin />
                </div>
              ) : !chat?.messages || chat.messages.length === 0 ? (
                <Empty description="No messages yet. Start the conversation!" />
              ) : (
                chat.messages.map((msg) => {
                  const isOwnMessage = String(msg.senderId._id) === String(user?._id);
                  return (
                    <div
                      key={msg._id || msg.createdAt}
                      className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                    >
                      {!isOwnMessage && (
                        <Avatar
                          src={msg.senderId.profilePhoto}
                          icon={<UserOutlined />}
                          size="small"
                        />
                      )}
                      <div className="message-content">
                        {msg.productInfo && (
                          <div className="message-product-info">
                            <div className="product-card-inline">
                              {msg.productInfo.productThumbnail ? (
                                <img
                                  src={msg.productInfo.productThumbnail}
                                  alt={msg.productInfo.productTitle}
                                  className="product-thumbnail-small"
                                />
                              ) : (
                                <div className="product-placeholder-small">No Image</div>
                              )}
                              <div className="product-info-inline">
                                <div className="product-title-inline">{msg.productInfo.productTitle}</div>
                                <div className="product-price-inline">
                                  ${msg.productInfo.productPrice?.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="message-text">{msg.text}</div>
                        <div className="message-time">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isOwnMessage && msg.seenBy && user?._id && (() => {
                            const otherParticipant = getOtherParticipant();
                            if (!otherParticipant) return null;
                            const otherUserId = otherParticipant.userId._id;
                            const seenByOther = msg.seenBy[otherUserId] || msg.seenBy[String(otherUserId)];
                            return seenByOther ? (
                              <span className="message-seen">✓✓</span>
                            ) : (
                              <span className="message-sent">✓</span>
                            );
                          })()}
                          {!isOwnMessage && msg.read && (
                            <span className="message-read">✓✓</span>
                          )}
                        </div>
                      </div>
                      {isOwnMessage && (
                        <Avatar
                          src={user?.profilePhoto}
                          icon={<UserOutlined />}
                          size="small"
                        />
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="chat-input">
              <Input.TextArea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={sending}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={sending}
                disabled={!messageText.trim()}
              >
                Send
              </Button>
            </div>
          </>
        )}
      </Card>
      </div>
    </div>
  );
};

export default ChatBox;
