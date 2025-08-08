import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('AuthContext: Token during initialization:', token ? 'Token present (length: ' + token.length + ')' : 'No token'); // Log the token for debugging
    if (token) {
      try {
        // Decode the user from the token if it exists
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('AuthContext: Decoded token payload:', { userId: payload.userId, role: payload.role, exp: payload.exp });
        
        // Check if token is expired
        if (payload.exp * 1000 > Date.now()) {
          setUser({ id: payload.userId, role: payload.role });
          console.log('AuthContext: Token is valid, user set');
        } else {
          // Token is expired, clear it
          console.log('AuthContext: Token is expired, clearing');
          logout();
        }
      } catch (e) {
        console.error("AuthContext: Failed to parse token:", e);
        logout();
      }
    } else {
      console.log('AuthContext: No token available');
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login for email:', email);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('AuthContext: Login response status:', res.status);
      console.log('AuthContext: Login response data:', { success: res.ok, hasToken: !!data.token, user: data.user });
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('AuthContext: Storing token in localStorage, length:', data.token?.length);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      // FIX: Return the data so the calling component can use it immediately.
      return data;

    } catch (err) {
      console.error('AuthContext: Login error:', err.message);
      // Re-throw the error to be caught by the component
      throw err;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out, clearing token and user data');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};