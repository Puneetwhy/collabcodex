// frontend/src/features/socket/socketSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,      // Whether the socket is connected
  onlineUsers: [],       // List of online users
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    // Update connection status
    setConnected: (state, action) => {
      state.connected = action.payload;
    },

    // Update list of online users
    setOnlineUsers: (state, action) => {
      state.onlineUsers = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const { setConnected, setOnlineUsers } = socketSlice.actions;
export default socketSlice.reducer;