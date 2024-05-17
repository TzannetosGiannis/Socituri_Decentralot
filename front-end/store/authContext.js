// authContext.js
import { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  // State to track authentication status
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Function to handle login
  const login = () => {
    setIsLoggedIn(true);
  };

  // Function to handle logout
  const logout = () => {
    setIsLoggedIn(false);
  };

  // Context value
  const authContextValue = {
    isLoggedIn,
    login,
    logout
  };

  // Provide the context value to children components
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
