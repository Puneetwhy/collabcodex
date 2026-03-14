// frontend/src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi';

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      if (token) localStorage.setItem('token', token);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.token = payload.token;
        if (payload.token) localStorage.setItem('token', payload.token);
      })
      // Signup
      .addMatcher(authApi.endpoints.signup.matchFulfilled, (state, { payload }) => {
        state.user = payload;
        state.token = payload.token;
        if (payload.token) localStorage.setItem('token', payload.token);
      })
      // Fetch current user
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, { payload }) => {
        state.user = payload;
      })
      // Optional: handle getMe rejected (e.g., token expired)
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;