import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from '../features/auth/authApi';
import { projectApi } from '../features/project/projectApi';
import { notificationApi } from '../features/notifications/notificationApi';
// Add more slices as needed

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    // Add more reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      projectApi.middleware,
      notificationApi.middleware
      // Add more
    ),
});

setupListeners(store.dispatch);