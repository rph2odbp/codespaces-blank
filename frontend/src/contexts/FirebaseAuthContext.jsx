import { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  getIdToken,
  getIdTokenResult
} from 'firebase/auth';
import { auth } from '../config/firebase';

const FirebaseAuthContext = createContext(null);

export function FirebaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the ID token and custom claims
          const tokenResult = await getIdTokenResult(firebaseUser);
          const customClaims = tokenResult.claims;
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
          });
          
          setClaims({
            role: customClaims.role || 'parent',
            ...customClaims
          });
          
          console.log('Firebase Auth: User authenticated', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: customClaims.role || 'parent'
          });
        } catch (error) {
          console.error('Error getting user claims:', error);
          setUser(null);
          setClaims(null);
        }
      } else {
        setUser(null);
        setClaims(null);
        console.log('Firebase Auth: User signed out');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register new user
  const register = async (email, password, additionalData) => {
    try {
      console.log('Firebase Auth: Attempting registration for email:', email);
      
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Register with backend to create MongoDB record and assign role
      const response = await fetch('/api/firebase-auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: additionalData.firstName,
          lastName: additionalData.lastName,
          email,
          password,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('Firebase Auth: Registration successful');
      return { success: true, user: firebaseUser, data };
    } catch (error) {
      console.error('Firebase Auth: Registration error:', error.message);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      console.log('Firebase Auth: Attempting login for email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get fresh ID token with custom claims
      const tokenResult = await getIdTokenResult(firebaseUser, true);
      
      console.log('Firebase Auth: Login successful', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: tokenResult.claims.role || 'parent'
      });
      
      return { success: true, user: firebaseUser, claims: tokenResult.claims };
    } catch (error) {
      console.error('Firebase Auth: Login error:', error.message);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      console.log('Firebase Auth: Logging out');
      await signOut(auth);
    } catch (error) {
      console.error('Firebase Auth: Logout error:', error.message);
      throw error;
    }
  };

  // Get current ID token
  const getToken = async () => {
    if (user && auth.currentUser) {
      try {
        return await getIdToken(auth.currentUser);
      } catch (error) {
        console.error('Error getting ID token:', error);
        return null;
      }
    }
    return null;
  };

  // Refresh custom claims
  const refreshClaims = async () => {
    if (auth.currentUser) {
      try {
        const tokenResult = await getIdTokenResult(auth.currentUser, true);
        setClaims({
          role: tokenResult.claims.role || 'parent',
          ...tokenResult.claims
        });
        console.log('Claims refreshed:', tokenResult.claims);
        return tokenResult.claims;
      } catch (error) {
        console.error('Error refreshing claims:', error);
        return null;
      }
    }
    return null;
  };

  const value = {
    user,
    claims,
    loading,
    register,
    login,
    logout,
    getToken,
    refreshClaims,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};