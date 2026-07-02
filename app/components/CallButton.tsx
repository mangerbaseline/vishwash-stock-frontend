'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Video, PhoneOff, Wifi, WifiOff } from 'lucide-react';
import { useCall } from '@/app/contexts/CallContext';

interface CallButtonProps {
  receiverId: string;
  type?: 'voice' | 'video';
  conversationId?: string;
  roomId?: string;
  isRoomCall?: boolean;
  participants?: string[];
  className?: string;
  showLabel?: boolean;
  receiverInfo?: {
    username: string;
    isOnline?: boolean;
    isActive?: boolean;
  };
}

export default function CallButton({
  receiverId,
  type = 'voice',
  conversationId,
  roomId,
  isRoomCall = false,
  participants,
  className = '',
  showLabel = false,
  receiverInfo
}: CallButtonProps) {
  const { initiateCall, activeCall, loading } = useCall();
  const [userStatus, setUserStatus] = useState<{ isOnline: boolean; isActive: boolean } | null>(null);

  useEffect(() => {
    if (receiverId) {
      fetchUserStatus();
    }
  }, [receiverId]);

  const fetchUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/${receiverId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserStatus(data.user);
        }
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    }
  };

  const handleCall = async () => {
    if (activeCall) return; // Already in a call
    
    // Check if user is online
    const isActiveStatus = userStatus?.isActive ?? receiverInfo?.isActive ?? false;
    if (!isActiveStatus) {
      alert('This user is currently offline');
      return;
    }
    
    try {
      await initiateCall(receiverId, type, conversationId, roomId, isRoomCall, participants);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  const isInCall = !!activeCall;
  const Icon = type === 'video' ? Video : Phone;
  const isActive = userStatus?.isActive ?? receiverInfo?.isActive ?? false;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleCall}
        disabled={loading || isInCall || !isActive}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          transition-all duration-200
          ${isInCall || !isActive
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
            : type === 'video'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title={
          !isActive 
            ? 'User is offline' 
            : isInCall 
              ? 'Already in a call' 
              : `Start ${type} call`
        }
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isInCall ? (
          <PhoneOff className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
        {showLabel && !isInCall && isActive && (
          <span className="text-sm font-medium">
            {type === 'video' ? 'Video Call' : 'Voice Call'}
          </span>
        )}
      </button>
      
      {/* Online status indicator */}
      {receiverInfo && (
        <div className="flex items-center gap-1 text-xs">
          {isActive ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500">Offline</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
