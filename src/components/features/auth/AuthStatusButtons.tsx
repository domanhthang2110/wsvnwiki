'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

export default function AuthStatusButtons() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      setLoading(false);
    } else {
      router.push('/'); // Redirect to homepage after logout
    }
  };

  if (loading) {
    return (
      <div className="p-2 text-gray-400 text-sm">Loading auth...</div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col gap-2 p-2">
        <Link href="/admin" className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors">
          <LayoutDashboard size={18} /> Admin Dashboard
        </Link>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
        >
          <LogOut size={18} /> {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    );
  } else {
    return (
      <div className="p-2">
        <Link href="/auth/login" className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <LogIn size={18} /> Login
        </Link>
      </div>
    );
  }
}
