'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
        setError(null);
      }, () => {
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      await setDoc(
        doc(db, 'users', u.uid),
        {
          name: u.displayName || 'User',
          email: u.email || '',
          photoURL: u.photoURL || '',
          plan: 'free',
          preferredLanguage: getCookie('aurexa_lang') || 'en',
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
      throw err;
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const u = result.user;
      await updateProfile(u, { displayName: name });
      await setDoc(
        doc(db, 'users', u.uid),
        {
          name,
          email,
          photoURL: '',
          plan: 'free',
          preferredLanguage: getCookie('aurexa_lang') || 'en',
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err: any) {
      setError(err?.message || 'Sign-up failed');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err?.message || 'Sign-in failed');
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
  }
