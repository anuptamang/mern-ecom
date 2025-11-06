import React, { useEffect, useState } from 'react';
import { Card, List, Avatar, Badge, Empty, Spin, Typography, Button, Space } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Container } from '@/components/UI';
import { getMyChatsApi } from '@/services/endPoints/chat/chatEndpoints';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import { ChatBox } from '@/components'
import './ChatsDashboard.scss';

const { Text, Title } = Typography;

interface ChatListItem {
  _id: string;
  participants: {
    userId: {
      _id: string;
      fullName: string;
      email: string;
      profilePhoto?: string;
      role: string;
    };
    role: string;
  }[];
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
  unreadCount: number;
  status: string;
}

const ChatsDashboard = () => {
  const title = usePageTitle();
  const { result: user } = useAppSelector(authSelector);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [showChatBox, setShowChatBox] = useState(false);

  useEffect(() => {
    loadChats();
    
    // Check if chatId is in URL params (from notification click)
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = urlParams.get('chatId');
    if (chatIdFromUrl) {
      // Find the chat and open it
      const foundChat = chats.find((c) => c._id === chatIdFromUrl);
      if (foundChat) {
        handleChatClick(foundChat);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    // Re-check URL params after chats load
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromUrl = urlParams.get('chatId');
    if (chatIdFromUrl && chats.length > 0) {
      const foundChat = chats.find((c) => c._id === chatIdFromUrl);
      if (foundChat && !selectedChat) {
        handleChatClick(foundChat);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await getMyChatsApi();
      setChats(response.data.chats || []);
    } catch (error: any) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (chat: ChatListItem) => {
    return chat.participants.find((p) => String(p.userId._id) !== String(user?._id));
  };

  const handleChatClick = (chat: ChatListItem) => {
    const otherParticipant = getOtherParticipant(chat);
    if (otherParticipant) {
      setSelectedChat(chat._id);
      setSelectedSellerId(String(otherParticipant.userId._id));
      setShowChatBox(true);
    }
  };

  const isSeller = user?.role === 'seller';
  const isBuyer = user?.role === 'user';

  return (
    <>
      {title}
      <Container className="py-6">
        <Card>
          <Title level={2}>
            {isSeller ? 'Messages from Buyers' : 'Messages with Sellers'}
          </Title>
          <Text type="secondary">
            {isSeller
              ? 'View and reply to messages from buyers about your products'
              : 'View your conversations with sellers'}
          </Text>

          <div style={{ marginTop: 24 }}>
            <Spin spinning={loading}>
              {chats.length === 0 ? (
                <Empty
                  description="No messages yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={chats}
                  renderItem={(chat) => {
                    const otherParticipant = getOtherParticipant(chat);
                    if (!otherParticipant) return null;

                    return (
                      <List.Item
                        style={{
                          cursor: 'pointer',
                          backgroundColor: selectedChat === chat._id ? '#f0f0f0' : 'transparent',
                        }}
                        onClick={() => handleChatClick(chat)}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge count={chat.unreadCount} offset={[-5, 5]}>
                              <Avatar
                                src={otherParticipant.userId.profilePhoto}
                                icon={<UserOutlined />}
                                size="large"
                              />
                            </Badge>
                          }
                          title={
                            <Space>
                              <Text strong>{otherParticipant.userId.fullName || 'Unknown'}</Text>
                              {chat.productContext && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  • {chat.productContext.productTitle}
                                </Text>
                              )}
                              {chat.unreadCount > 0 && (
                                <Badge count={chat.unreadCount} />
                              )}
                            </Space>
                          }
                          description={
                            <div>
                              {chat.lastMessage && (
                                <Text
                                  ellipsis
                                  style={{
                                    color: chat.unreadCount > 0 ? '#1890ff' : '#666',
                                    fontWeight: chat.unreadCount > 0 ? 500 : 400,
                                  }}
                                >
                                  {chat.lastMessage.text}
                                </Text>
                              )}
                              {chat.lastMessage?.timestamp && (
                                <div style={{ marginTop: 4, fontSize: 12, color: 'var(--theme-text-secondary, #999)' }}>
                                  {new Date(chat.lastMessage.timestamp).toLocaleString()}
                                </div>
                              )}
                            </div>
                          }
                        />
                        <Button
                          type="link"
                          icon={<MessageOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatClick(chat);
                          }}
                        >
                          Open Chat
                        </Button>
                      </List.Item>
                    );
                  }}
                />
              )}
            </Spin>
          </div>
        </Card>
      </Container>

      {/* Chat Box */}
      {showChatBox && (selectedChat || selectedSellerId) && (
        <ChatBox
          chatId={selectedChat || undefined}
          sellerId={selectedSellerId || undefined}
          onClose={() => {
            setShowChatBox(false);
            setSelectedChat(null);
            setSelectedSellerId(null);
            loadChats(); // Refresh chat list
          }}
        />
      )}
    </>
  );
};

export default ChatsDashboard;
