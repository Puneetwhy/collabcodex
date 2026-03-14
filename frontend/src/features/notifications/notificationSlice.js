// frontend/src/features/notifications/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Replace entire notifications list
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },

    // Add a single notification (usually from socket)
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) state.unreadCount += 1;
    },

    // Mark a specific notification as read
    markAsRead: (state, action) => {
      const id = action.payload;
      const notif = state.notifications.find(n => n._id === id);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(state.unreadCount - 1, 0);
      }
    },

    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;