import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('mindease_token'));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('mindease_token', token);
    } else {
      localStorage.removeItem('mindease_token');
    }
  }, [token]);

  const getUserInfo = () => {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch(e) {
      return null;
    }
  };
  const user = getUserInfo();


  const login = (newToken) => setToken(newToken);
  const logout = () => setToken(null);
  
  const openLogin = () => {
    setIsRegistering(false);
    setShowAuthModal(true);
  };
  
  const openRegister = () => {
    setIsRegistering(true);
    setShowAuthModal(true);
  };
  
  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <AuthContext.Provider value={{
      token, user, login, logout,
      showAuthModal, isRegistering, setIsRegistering,
      openLogin, openRegister, closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
