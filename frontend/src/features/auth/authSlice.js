// frontend/src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { authApi } from './authApi'; // we'll create this next if not already

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
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addMatcher(authApi.endpoints.signup.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;