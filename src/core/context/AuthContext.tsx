import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { UserProfile, UserPrivate } from '../models/types';
import { userService } from '../services/userService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  userPrivate: UserPrivate | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (displayName: string, username: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  updatePrivateSettings: (data: Partial<UserPrivate>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPrivate, setUserPrivate] = useState<UserPrivate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user data from Firestore
  const loadUserData = async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      } else {
        // Generate a clean username from email or display name
        const baseUsername = (user.email ? user.email.split('@')[0] : 'user')
          .replace(/[^a-zA-Z0-9_]/g, '')
          .slice(0, 20);
        const username = baseUsername.length >= 3 ? baseUsername : `user_${user.uid.slice(0, 6)}`;

        const now = new Date().toISOString();
        const initialProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || username,
          username: username.toLowerCase(),
          bio: '',
          photoUrl: user.photoURL || '',
          followersCount: 0,
          followingCount: 0,
          questionCount: 0,
          answerCount: 0,
          reputation: 10,
          isActive: true,
          createdAt: now,
          updatedAt: now
        };

        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
      }

      // Load private data
      const privateRef = doc(db, 'users', user.uid, 'private', 'info');
      const privateSnap = await getDoc(privateRef);
      if (privateSnap.exists()) {
        setUserPrivate(privateSnap.data() as UserPrivate);
      } else {
        const initialPrivate: UserPrivate = {
          email: user.email || '',
          defaultAnonymous: false,
          emailNotifications: true,
          pushNotifications: false,
          themePreference: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(privateRef, initialPrivate);
        setUserPrivate(initialPrivate);
      }
    } catch (err) {
      console.error('Error synchronizing user profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserData(user);
      } else {
        setUserProfile(null);
        setUserPrivate(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      await loadUserData(result.user);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await loadUserData(result.user);
    }
  };

  const signUpWithEmail = async (displayName: string, username: string, email: string, pass: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName });
      const now = new Date().toISOString();
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

      const initialProfile: UserProfile = {
        uid: res.user.uid,
        displayName: displayName.trim(),
        username: cleanUsername,
        bio: '',
        photoUrl: '',
        followersCount: 0,
        followingCount: 0,
        questionCount: 0,
        answerCount: 0,
        reputation: 10,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(doc(db, 'users', res.user.uid), initialProfile);
      setUserProfile(initialProfile);

      const initialPrivate: UserPrivate = {
        email: email.trim(),
        defaultAnonymous: false,
        emailNotifications: true,
        pushNotifications: false,
        themePreference: 'system',
        createdAt: now,
        updatedAt: now
      };
      await setDoc(doc(db, 'users', res.user.uid, 'private', 'info'), initialPrivate);
      setUserPrivate(initialPrivate);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setUserPrivate(null);
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    try {
      const uid = currentUser.uid;
      await userService.deleteAccountData(uid);
      try {
        await currentUser.delete();
      } catch (authErr) {
        console.warn('Firebase user delete note (e.g. requires recent login); signing out', authErr);
        await signOut(auth);
      }
      setUserProfile(null);
      setUserPrivate(null);
      setCurrentUser(null);
    } catch (err) {
      console.error('Error during account deletion:', err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      const now = new Date().toISOString();
      const updated = {
        ...data,
        updatedAt: now
      };
      await updateDoc(doc(db, 'users', currentUser.uid), updated);
      setUserProfile(prev => prev ? { ...prev, ...updated } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const updatePrivateSettings = async (data: Partial<UserPrivate>) => {
    if (!currentUser) return;
    try {
      const now = new Date().toISOString();
      const updated = {
        ...data,
        updatedAt: now
      };
      await updateDoc(doc(db, 'users', currentUser.uid, 'private', 'info'), updated);
      setUserPrivate(prev => prev ? { ...prev, ...updated } : null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}/private/info`);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await loadUserData(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        userPrivate,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        deleteAccount,
        resetPassword,
        updateProfileData,
        updatePrivateSettings,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
