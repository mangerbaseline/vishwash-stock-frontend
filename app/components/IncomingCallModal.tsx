'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Phone, Video, PhoneOff, User } from 'lucide-react';
import { useCall } from '@/app/contexts/CallContext';

export default function IncomingCallModal() {
  const { incomingCall, acceptCall, rejectCall, setIncomingCall } = useCall();
  const ringtoneCtxRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (ringtoneCtxRef.current) {
      ringtoneCtxRef.current.close().catch(() => {});
      ringtoneCtxRef.current = null;
    }
  }, []);

  const startRingtone = useCallback(() => {
    stopRingtone();
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ringtoneCtxRef.current = ctx;

      const playTone = (freq: number, startOffset: number, duration: number, vol: number = 0.2) => {
        if (!ringtoneCtxRef.current) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = ctx.currentTime + startOffset;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.start(t);
        osc.stop(t + duration);
      };

      // Pleasant rising chime: C5 → E5 → G5, pause, repeat
      const playChime = () => {
        if (!ringtoneCtxRef.current) return;
        // First ring
        playTone(523.25, 0, 0.18, 0.2);      // C5
        playTone(659.25, 0.15, 0.18, 0.22);   // E5
        playTone(783.99, 0.30, 0.25, 0.25);   // G5
        // Second ring (slightly higher)
        playTone(659.25, 0.65, 0.15, 0.18);   // E5
        playTone(783.99, 0.80, 0.18, 0.2);    // G5
        playTone(1046.50, 0.95, 0.3, 0.22);   // C6
      };

      playChime();
      ringtoneIntervalRef.current = setInterval(playChime, 2500);
    } catch (error) {
      console.error('Error starting ringtone:', error);
    }
  }, [stopRingtone]);

  useEffect(() => {
    if (incomingCall) {
      startRingtone();
    } else {
      stopRingtone();
    }

    return () => {
      stopRingtone();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [incomingCall, startRingtone, stopRingtone]);

  const handleAccept = async () => {
    if (!incomingCall) return;
    stopRingtone();
    
    try {
      await acceptCall(incomingCall._id);
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleReject = async () => {
    if (!incomingCall) return;
    stopRingtone();
    
    try {
      await rejectCall(incomingCall._id);
      setIncomingCall(null);
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  if (!incomingCall) return null;

  const caller = incomingCall.caller;
  const isVideo = incomingCall.type === 'video';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ animation: 'slideUp 0.3s ease-out' }}>
        {/* Header with gradient */}
        <div className={`p-6 ${isVideo ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}>
          <div className="text-center">
            <div className="relative inline-block mb-4">
              {caller.avatar ? (
                <img
                  src={caller.avatar}
                  alt={caller.username}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-600" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-4 border-white rounded-full" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {caller.username}
            </h2>
            <p className="text-white/90 text-sm">
              Incoming {isVideo ? 'Video' : 'Voice'} Call...
            </p>
          </div>
        </div>

        {/* Call info */}
        <div className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-6">
            {isVideo ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            <span className="text-sm">
              {isVideo ? 'Video Call' : 'Voice Call'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Reject button */}
            <button
              onClick={handleReject}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-110">
                <PhoneOff className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Decline
              </span>
            </button>

            {/* Accept button */}
            <button
              onClick={handleAccept}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-16 h-16 rounded-full ${isVideo ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-110`} style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                <Phone className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Accept
              </span>
            </button>
          </div>
        </div>

        {/* Timer */}
        <div className="px-6 pb-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ringing...
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}