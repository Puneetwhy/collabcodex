import { useDispatch } from 'react-redux';
import { setCredentials, logout as logoutAction } from '@/features/auth/authSlice';
import { useGetMeQuery } from '@/features/auth/authApi';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const { data: user, isLoading, error, refetch } = useGetMeQuery(undefined, {
    skip: !token,
  });

  const login = ({ user, token }) => {
    localStorage.setItem('token', token);
    dispatch(setCredentials({ user, token }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch(logoutAction());
    navigate('/login');
  };

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refetchUser: refetch,
  };
};