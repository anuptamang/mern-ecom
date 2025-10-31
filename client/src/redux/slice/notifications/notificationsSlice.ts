import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getNotificationsApi,
  getUnreadCountApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
} from "services/endPoints/notifications";
import { INotificationState, INotification } from "types/store/notifications/notificationTypes";

const initialState: INotificationState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  status: {
    loading: false,
    error: {
      message: "",
    },
  },
};

// Fetch notifications
export const fetchNotifications = createAsyncThunk<
  { notifications: INotification[]; unreadCount: number; total: number },
  { read?: boolean; limit?: number; skip?: number } | undefined
>("notifications/fetch", async (params) => {
  const response = await getNotificationsApi(params);
  return response.data;
});

// Fetch unread count only
export const fetchUnreadCount = createAsyncThunk<number>(
  "notifications/fetchUnreadCount",
  async () => {
    const response = await getUnreadCountApi();
    return response.data.unreadCount;
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk<string, string>(
  "notifications/markAsRead",
  async (id) => {
    await markAsReadApi(id);
    return id;
  }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk<void>(
  "notifications/markAllAsRead",
  async () => {
    await markAllAsReadApi();
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk<string, string>(
  "notifications/delete",
  async (id) => {
    await deleteNotificationApi(id);
    return id;
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.total = 0;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status.loading = true;
        state.status.error.message = "";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.total = action.payload.total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status.loading = false;
        state.status.error.message =
          action.error.message || "Failed to fetch notifications";
      });

    // Fetch unread count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        // Silently fail unread count fetch
      });

    // Mark as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n._id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state) => {
        // Silently fail
      });

    // Mark all as read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          if (!n.read) {
            n.read = true;
            n.readAt = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state) => {
        // Silently fail
      });

    // Delete notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n._id === action.payload);
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(
          (n) => n._id !== action.payload
        );
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export const { clearNotifications, incrementUnreadCount, decrementUnreadCount } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;

