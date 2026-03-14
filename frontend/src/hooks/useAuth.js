// frontend/src/hooks/useAuth.js
import { useDispatch } from 'react-redux';
import { setCredentials, logout as logoutAction } from '@/features/auth/authSlice';
import { useGetMeQuery } from '@/features/auth/authApi';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch current user only if token exists
  const { data: user, isLoading, error, refetch } = useGetMeQuery(undefined, {
    skip: !token,
  });

  // Login helper
  const login = ({ user, token }) => {
    if (!token || !user) return;
    localStorage.setItem('token', token);
    dispatch(setCredentials({ user, token }));
  };

  // Logout helper
  const logout = () => {
    localStorage.removeItem('token');
    dispatch(logoutAction());
    navigate('/login', { replace: true });
  };

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refetchUser: refetch,
    error,
  };
};