'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface StatusToggleProps {
  userId: string;
  initialStatus?: {
    isOnline: boolean;
    isActive: boolean;
  };
  onStatusChange?: (status: { isOnline: boolean; isActive: boolean }) => void;
}

export default function StatusToggle({ userId, initialStatus, onStatusChange }: StatusToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus?.isActive ?? true);
  const [loading, setLoading] = useState(false);

  // Fetch current status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/auth/${userId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setIsActive(data.user.isActive);
            onStatusChange?.({
              isOnline: data.user.isOnline,
              isActive: data.user.isActive
            });
          }
        }
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };

    if (userId) {
      fetchStatus();
    }
  }, [userId]);

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/auth/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsActive(data.user.isActive);
          onStatusChange?.({
            isOnline: data.user.isOnline,
            isActive: data.user.isActive
          });
        }
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-200
        ${isActive
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-gray-500 hover:bg-gray-600 text-white'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg hover:shadow-xl
      `}
      title={isActive ? 'Click to go offline' : 'Click to go online'}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isActive ? (
        <>
          <Wifi className="w-5 h-5" />
          <span className="text-sm font-medium">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">Offline</span>
        </>
      )}
    </button>
  );
}