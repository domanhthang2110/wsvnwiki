'use client';

import { useState, FormEvent, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/button';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const currentEmail = formData.get('email') as string;
    const currentPassword = formData.get('password') as string;

    console.log('Email from FormData:', currentEmail);
    console.log('Password from FormData:', currentPassword);
    console.log('Email state at call time:', email);
    console.log('Password state at call time:', password);

    if (!currentEmail || !currentPassword) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });

    setLoading(false);

    console.log('Supabase signInWithPassword data:', data);
    console.log('Supabase signInWithPassword error:', signInError);

    if (signInError) {
      setError(signInError.message);
      console.error('Login error:', signInError);
    } else if (data.user) {
      const redirectedFrom = searchParams.get('redirectedFrom');
      if (redirectedFrom) {
        router.push(redirectedFrom);
      } else {
        router.push('/admin');
      }
    } else {
      setError("Login failed: No user data returned. Check email confirmation?");
      console.error("Login failed: No user data returned from signInWithPassword.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        Admin Login
      </h1>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}

        <div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            Sign in
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <Link href="/" passHref>
          <Button variant="outline" className="w-full">
            Back to Wiki
          </Button>
        </Link>
      </div>
      {loading && <LoadingOverlay darkened />}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <LoginPageContent />
    </Suspense>
  );
}
