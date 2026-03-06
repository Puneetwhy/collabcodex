import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/notifications',
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token || localStorage.getItem('token'); // ✅ safe
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: '/',
        params,
      }),
      providesTags: ['Notifications'],
    }),
    getUnreadCount: builder.query({
      query: () => '/unread-count',
      providesTags: ['Notifications'],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;