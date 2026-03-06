import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/auth', // backend URL
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token || localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/login', method: 'POST', body: credentials }),
      invalidatesTags: ['User'],
    }),
    signup: builder.mutation({
      query: (userData) => ({ url: '/signup', method: 'POST', body: userData }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/me',
      providesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({ url: '/logout', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useGetMeQuery, useLogoutMutation } = authApi;