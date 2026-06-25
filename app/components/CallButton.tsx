'use client';

import React from 'react';
import { Phone, Video, PhoneOff } from 'lucide-react';
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
}

export default function CallButton({
  receiverId,
  type = 'voice',
  conversationId,
  roomId,
  isRoomCall = false,
  participants,
  className = '',
  showLabel = false
}: CallButtonProps) {
  const { initiateCall, activeCall, loading } = useCall();

  const handleCall = async () => {
    if (activeCall) return; // Already in a call
    
    try {
      await initiateCall(receiverId, type, conversationId, roomId, isRoomCall, participants);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  const isInCall = !!activeCall;
  const Icon = type === 'video' ? Video : Phone;

  return (
    <button
      onClick={handleCall}
      disabled={loading || isInCall}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-200
        ${isInCall 
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
          : type === 'video'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isInCall ? 'Already in a call' : `Start ${type} call`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : isInCall ? (
        <PhoneOff className="w-5 h-5" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
      {showLabel && !isInCall && (
        <span className="text-sm font-medium">
          {type === 'video' ? 'Video Call' : 'Voice Call'}
        </span>
      )}
    </button>
  );
}