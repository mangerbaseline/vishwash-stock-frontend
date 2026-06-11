'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import Sidebar from '@/app/components/Sidebar';
import Header from '@/app/components/Header';
import { login, logout } from '@/store/authSlice';
import Footer from '../components/Footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname(); // Get current path

  // Get token from Redux store
  const token = useSelector((state: any) => state.auth?.token);
  const user = useSelector((state: any) => state.auth?.user);

  useEffect(() => {
    const checkAuth = async () => {
      // Get token from multiple sources
      let authToken = token;

      // If no token in Redux, check localStorage
      if (!authToken) {
        authToken = localStorage.getItem('token');

        // If found in localStorage, restore to Redux
        if (authToken) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const userData = JSON.parse(userStr);
              dispatch(login({
                token: authToken,
                user: userData
              }));
            } catch (err) {
              console.error('Error parsing user data:', err);
            }
          }
        }
      }

      // If still no token, redirect to login
      if (!authToken) {
        console.log('No authentication token found');
        router.push('/Authentication/signin');
        setLoading(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        console.log('🔍 Checking auth with token:', authToken.substring(0, 20) + '...');

        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        console.log('✅ Auth check successful:', res.data);

        // Handle the response format { success: true, user: {...} } or direct user object
        let userData = res.data;
        if (userData && userData.success && userData.user) {
          userData = userData.user;
        }

        if (userData && (userData._id || userData.username || userData.email)) {
          console.log('✅ Setting user data in Redux:', userData.role);
          // Update Redux with fresh user data
          dispatch(login({
            token: authToken,
            user: userData
          }));

          // Update localStorage
          localStorage.setItem('token', authToken);
          localStorage.setItem('user', JSON.stringify(userData));
          setError(null);
        } else {
          console.warn('Unexpected response format:', res.data);
          // Still try to use it if it has basic structure
          if (res.data) {
            dispatch(login({
              token: authToken,
              user: res.data
            }));
          } else {
            throw new Error('Invalid user data received');
          }
        }

      } catch (err: any) {
        console.error('❌ Auth check failed:', err);
        setError(err.message || 'Authentication failed');

        // Only clear storage on auth errors (401, 403)
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch(logout());

          setTimeout(() => {
            router.push('/Authentication/signin');
          }, 1500);
        } else {
          // For network errors, keep the token but show error
          console.log('Non-auth error, keeping existing token');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch, router]); // Remove token to avoid infinite loop

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
          <p className="text-sm text-gray-500 mt-2">
            {token ? 'Token found, verifying...' : 'Checking for saved session...'}
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded text-sm">
              <p>Note: {error}</p>
              <p className="text-xs mt-1">Continuing with cached data...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 relative">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-3 sm:p-4 md:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
      <footer className={`relative ${pathname.includes('dashboard') ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-900 to-gray-800'} text-white overflow-hidden`}>

        <Footer />

      </footer>
    </div>
  );
}