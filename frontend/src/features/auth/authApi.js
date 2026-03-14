// frontend/src/features/auth/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Read base URL from environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/auth`,
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state or localStorage
      const token = getState()?.auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response) => response.user,
      transformErrorResponse: (err) => err.data?.message || 'Login failed',
    }),

    // Signup mutation
    signup: builder.mutation({
      query: (userData) => ({
        url: '/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response) => response.user,
      transformErrorResponse: (err) => err.data?.message || 'Signup failed',
    }),

    // Get current authenticated user
    getMe: builder.query({
      query: () => '/me',
      providesTags: ['User'],
      transformResponse: (response) => response.user,
      transformErrorResponse: (err) => err.data?.message || 'Failed to fetch user',
    }),

    // Logout mutation
    logout: builder.mutation({
      query: () => ({ url: '/logout', method: 'POST' }),
      invalidatesTags: ['User'],
      transformErrorResponse: (err) => err.data?.message || 'Logout failed',
    }),
  }),
});

// Export auto-generated hooks
export const {
  useLoginMutation,
  useSignupMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;