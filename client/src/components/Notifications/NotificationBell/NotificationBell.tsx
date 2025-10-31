import { BellOutlined } from "@ant-design/icons";
import { Badge, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "redux/store";
import {
  fetchNotifications,
  fetchUnreadCount,
} from "redux/slice/notifications/notificationsSlice";
import { useEffect, useRef, useState } from "react";
import { NotificationDropdown } from "../NotificationDropdown/NotificationDropdown";
import "./NotificationBell.scss";

export const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
        if (dropdownVisible) {
          dispatch(fetchNotifications({ limit: 20 }));
        }
      }, 30000);

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

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [dropdownVisible]);

  if (!result?._id) {
    return null; // Don't show notifications for unauthenticated users
  }

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <Badge count={unreadCount} size="small" offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          onClick={handleBellClick}
          className="notification-bell-button"
        />
      </Badge>
      {dropdownVisible && (
        <NotificationDropdown
          onClose={() => setDropdownVisible(false)}
          onNavigate={(url) => {
            setDropdownVisible(false);
            navigate(url);
          }}
        />
      )}
    </div>
  );
};
