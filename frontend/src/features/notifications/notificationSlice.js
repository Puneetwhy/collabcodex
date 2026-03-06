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
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      const id = action.payload;
      const notif = state.notifications.find(n => n._id === id);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.read = true; });
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;