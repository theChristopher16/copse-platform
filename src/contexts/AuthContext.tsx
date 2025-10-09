import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { authService, AppUser } from '../services/authService';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      try {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          
          // Get the full user profile from Firestore
          const appUser = await authService.getUserProfile(firebaseUser.uid);
          setUser(appUser);
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.signInWithEmail(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.signUpWithEmail(email, password, displayName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AppUser>): Promise<void> => {
    try {
      setError(null);
      if (!user) {
        throw new Error('No user logged in');
      }
      
      await authService.updateUserProfile(user.uid, updates);
      
      // Refresh the user data
      await refreshUser();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (firebaseUser) {
        const appUser = await authService.getUserProfile(firebaseUser.uid);
        setUser(appUser);
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh user profile');
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;