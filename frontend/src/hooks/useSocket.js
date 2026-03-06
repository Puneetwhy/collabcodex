// frontend/src/hooks/useSocket.js
import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const useSocket = (projectId = null) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const socket = useMemo(() => {
    if (!isAuthenticated || !user) return null;

    const token = localStorage.getItem('token');
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    return newSocket;
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('presence-update', (users) => {
      setOnlineUsers(users);
    });

    // Auto-join project room when projectId changes
    if (projectId) {
      socket.emit('join-project', { projectId });
    }

    return () => {
      if (projectId) {
        socket.emit('leave-project', { projectId });
      }
      socket.disconnect();
    };
  }, [socket, projectId]);

  return {
    socket,
    isConnected,
    onlineUsers,
  };
};