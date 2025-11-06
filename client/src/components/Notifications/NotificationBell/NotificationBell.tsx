'use client';

import { BellOutlined } from "@ant-design/icons";
import { Badge, Button } from "antd";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  fetchNotifications,
  fetchUnreadCount,
} from "@/redux/slice/notifications/notificationsSlice";
import { useEffect, useRef, useState } from "react";
import { NotificationDropdown } from "../NotificationDropdown/NotificationDropdown";
import { useTheme } from "@/hooks/useTheme";
import "./NotificationBell.scss";

export const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { unreadCount, notifications } = useAppSelector(
    (state) => state.notifications
  );
  const { result } = useAppSelector((state) => state.auth);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (result?._id) {
      dispatch(fetchNotifications({ limit: 20 }));
      dispatch(fetchUnreadCount());

      // Poll for new notifications every 5 seconds for faster updates
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
        if (dropdownVisible) {
          dispatch(fetchNotifications({ limit: 20 }));
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [result?._id, dispatch, dropdownVisible]);

  const handleBellClick = () => {
    if (dropdownVisible) {
      setDropdownVisible(false);
    } else {
      setDropdownVisible(true);
      // Fetch latest notifications when opening dropdown
      dispatch(fetchNotifications({ limit: 20 }));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownVisible]);

  const handleNotificationClick = (notification: any) => {
    // Navigate based on notification type
    if (notification.type === "return" && notification.returnId) {
      router.push(`/user/returns?returnId=${notification.returnId}`);
    } else if (notification.type === "order" && notification.orderId) {
      router.push(`/user/orders?orderId=${notification.orderId}`);
    } else if (notification.type === "delivery" && notification.deliveryId) {
      router.push(`/user/delivery-person?deliveryId=${notification.deliveryId}`);
    }
    setDropdownVisible(false);
  };

  if (!result?._id) {
    return null;
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined />}
          onClick={handleBellClick}
          style={{
            color: "var(--theme-header-text, #1d1d1f)",
            fontSize: "24px",
          }}
        />
      </Badge>
      {dropdownVisible && (
        <NotificationDropdown
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onClose={() => setDropdownVisible(false)}
        />
      )}
    </div>
  );
};
