import {
  CommentOutlined,
  StarOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  DeleteOutlined,
  CheckOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { List, Button, Empty, Spin, Space, Divider, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "redux/store";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  fetchNotifications,
} from "redux/slice/notifications/notificationsSlice";
import { INotification } from "types/store/notifications/notificationTypes";
import moment from "moment";
import "./NotificationDropdown.scss";

const { Text } = Typography;

interface NotificationDropdownProps {
  onClose: () => void;
  onNavigate: (url: string) => void;
}

export const NotificationDropdown = ({
  onClose,
  onNavigate,
}: NotificationDropdownProps) => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, status } = useAppSelector(
    (state) => state.notifications
  );

  const getNotificationIcon = (type: INotification["type"]) => {
    switch (type) {
      case "comment":
        return <CommentOutlined style={{ color: "#1890ff" }} />;
      case "rating":
      case "review":
        return <StarOutlined style={{ color: "#faad14" }} />;
      case "reply":
        return <MessageOutlined style={{ color: "#52c41a" }} />;
      case "order":
        return <ShoppingOutlined style={{ color: "#52c41a" }} />;
      case "order_cancelled":
        return <ShoppingCartOutlined style={{ color: "#ff4d4f" }} />;
      case "cart_update":
        return <ShoppingCartOutlined style={{ color: "#722ed1" }} />;
      case "product_update":
        return <InfoCircleOutlined style={{ color: "#1890ff" }} />;
      case "chat":
        return <MessageOutlined style={{ color: "#1890ff" }} />;
      case "system":
      default:
        return <InfoCircleOutlined style={{ color: "#595959" }} />;
    }
  };

  const handleNotificationClick = async (notification: INotification) => {
    // Mark as read first
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }

    // Navigate to the related content
    let navigateUrl = notification.actionUrl;
    let scrollTarget: string | null = null;
    
    // If actionUrl is not set, try to construct it from relatedEntity
    if (!navigateUrl && notification.relatedEntity) {
      const { entityType, entityId } = notification.relatedEntity;
      switch (entityType) {
        case "product":
          navigateUrl = `/products/${entityId}`;
          break;
        case "order":
          navigateUrl = `/user/orders`;
          break;
        case "chat":
          // For chat notifications, navigate to chat page with chatId
          navigateUrl = `/user/chats?chatId=${entityId}`;
          break;
        case "comment":
        case "rating":
          // For comments/ratings, navigate to the product page
          if (notification.metadata?.productId) {
            navigateUrl = `/products/${notification.metadata.productId}`;
          }
          break;
        default:
          break;
      }
    }

    // Determine scroll target based on notification type
    if (notification.type === "comment" || notification.type === "reply") {
      scrollTarget = "product-comments-section";
    } else if (notification.type === "rating" || notification.type === "review") {
      scrollTarget = "product-ratings-section";
    }

    // Extract hash from actionUrl if present, or add scroll target
    if (navigateUrl) {
      const url = new URL(navigateUrl, window.location.origin);
      const existingHash = url.hash;
      
      if (scrollTarget && !existingHash) {
        // Add hash fragment for scrolling
        navigateUrl = `${navigateUrl}#${scrollTarget}`;
      } else if (existingHash) {
        // Keep existing hash
        navigateUrl = url.href.replace(url.origin, '');
      }
      
      onNavigate(navigateUrl);
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const formatTime = (dateString: string) => {
    try {
      return moment(dateString).fromNow();
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown-header">
        <Space>
          <Text strong>Notifications</Text>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} new</span>
          )}
        </Space>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      <Divider style={{ margin: "8px 0" }} />

      <div className="notification-dropdown-content">
        {status.loading ? (
          <div className="notification-loading">
            <Spin size="small" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
            style={{ padding: "24px 0" }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification: INotification) => (
              <List.Item
                className={`notification-item ${notification.read ? "read" : "unread"}`}
                onClick={() => handleNotificationClick(notification)}
                style={{ cursor: "pointer" }}
              >
                <div className="notification-item-content">
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-body">
                    <div className="notification-title-row">
                      <Text
                        strong={!notification.read}
                        className="notification-title"
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <span className="unread-indicator" />
                      )}
                    </div>
                    <Text
                      type="secondary"
                      className="notification-message"
                      ellipsis
                    >
                      {notification.message}
                    </Text>
                    <Text
                      type="secondary"
                      className="notification-time"
                      style={{ fontSize: "11px" }}
                    >
                      {formatTime(notification.createdAt)}
                    </Text>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    className="notification-delete-button"
                    onClick={(e) => handleDelete(notification._id, e)}
                    danger
                  />
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};
