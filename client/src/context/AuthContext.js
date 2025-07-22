import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const initializeAuth = () => {
      const user = authService.getCurrentUser();
      setUser(user);
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.user);
    return response;
  };

  const resetPassword = async ({ email, newPassword }) => {
    const response = await authService.resetPassword({ email, newPassword });
    return response;
  };

  const verifyEmailForReset = async (email) => {
    const response = await authService.verifyEmailForReset(email);
    return response;
  };


  const logout = () => {
    authService.logout();
    setUser(null);
    // Use window.location for immediate redirect to avoid race condition with ProtectedRoute
    window.location.href = '/';
  };

  const value = {
    user,
    login,
    register,
    logout,
    resetPassword,
    verifyEmailForReset,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Auth must be used within an Auth Provider');
  }
  return context;
};