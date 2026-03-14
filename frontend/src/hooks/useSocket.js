import { useEffect, useMemo, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const useSocket = (projectId = null) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  // Initialize socket only once per user/session
  const socket = useMemo(() => {
    if (!isAuthenticated || !user) return null;

    if (!socketRef.current) {
      const token = localStorage.getItem('token');
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    return socketRef.current;
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handlePresenceUpdate = (users) => setOnlineUsers(users);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('presence-update', handlePresenceUpdate);

    // Auto-join project room if projectId is provided
    if (projectId) {
      socket.emit('join-project', { projectId });
    }

    // Cleanup on unmount or project change
    return () => {
      if (projectId) {
        socket.emit('leave-project', { projectId });
      }
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('presence-update', handlePresenceUpdate);
      
    };
  }, [socket, projectId]);

  return {
    socket,
    isConnected,
    onlineUsers,
  };
};