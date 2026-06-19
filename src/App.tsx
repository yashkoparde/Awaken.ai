import React, { useState, useEffect } from 'react';
import NeuralLink from './components/NeuralLink';
import WarMap from './components/WarMap';
import { api } from './lib/api';
import { auth, onAuthStateChanged } from './lib/supabase';

type View = 'auth' | 'dashboard';

export default function App() {
  const [view, setView] = useState<View>('auth');
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Listen to PHP API Auth
    const unsubPhp = api.onAuthStateChanged((phpUser) => {
      if (phpUser) {
        setUser(phpUser);
        setView('dashboard');
        setIsReady(true);
        return;
      }
      
      // 2. Fallback to Supabase / Local storage auth if PHP session not present
      const unsubSupa = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setView('dashboard');
        } else {
          setUser(null);
          setView('auth');
        }
        setIsReady(true);
      });

      return () => unsubSupa();
    });

    return () => unsubPhp();
  }, []);

  if (!isReady) return <div className="bg-slate-950 fixed inset-0" />;

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30 selection:text-white">
      {view === 'auth' && (
        <NeuralLink onSuccess={(u) => {
          setUser(u);
          setView('dashboard');
        }} />
      )}

      {view === 'dashboard' && user && (
        <WarMap user={user} />
      )}
    </main>
  );
}

