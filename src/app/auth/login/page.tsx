'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/Button/button'; // Import Button

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Get form data directly from the event target
    const formData = new FormData(event.currentTarget);
    const currentEmail = formData.get('email') as string;
    const currentPassword = formData.get('password') as string;

    // Log the values just before the call
    console.log('Email from FormData:', currentEmail);
    console.log('Password from FormData:', currentPassword);
    console.log('Email state at call time:', email); // Keep this for comparison
    console.log('Password state at call time:', password); // Keep this for comparison

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
    } else if (data.user) { // Check if user data is present, indicating success
      // Successful login
      const redirectedFrom = searchParams.get('redirectedFrom'); // Get the redirect path
      if (redirectedFrom) {
        router.push(redirectedFrom); // Redirect to original intended path
      } else {
        router.push('/admin'); // Default redirect to admin dashboard
      }
    } else {
      // This else block might catch cases where there's no error but also no user (e.g., email not confirmed)
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
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <Link href="/" passHref>
          <Button variant="outline" className="w-full text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            Back to Wiki
          </Button>
        </Link>
      </div>
    </div>
  );
}
