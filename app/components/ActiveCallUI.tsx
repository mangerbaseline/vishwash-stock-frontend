'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, User, Video, VideoOff, MonitorUp, MonitorOff, Maximize2, Minimize2 } from 'lucide-react';
import { useCall } from '@/app/contexts/CallContext';

export default function ActiveCallUI() {
  const { activeCall, endCall, cancelCall, localStreamRef, remoteStreamRef, remoteStreamVersion, isScreenSharing, toggleScreenShare } = useCall();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isVoiceScreenShareReady, setIsVoiceScreenShareReady] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const screenShareRef = useRef<HTMLDivElement | null>(null);
  const callUiRef = useRef<HTMLDivElement | null>(null);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  useEffect(() => {
    if (activeCall && activeCall.status === 'accepted') {
      // Start timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      // Reset timer
      setCallDuration(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeCall]);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [activeCall, localStreamRef, isScreenSharing]);

  // Attach remote stream to video/audio element
  useEffect(() => {
    if (remoteStreamRef.current) {
      console.log('🎥 Attaching remote stream to elements, version:', remoteStreamVersion);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(e => console.warn('Video play failed:', e));
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStreamRef.current;
        remoteAudioRef.current.play().catch(e => console.warn('Audio play failed:', e));
      }
    }
  }, [activeCall, remoteStreamRef, remoteStreamVersion]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    
    try {
      // Try to cancel first (for ringing/initiated calls)
      if (activeCall.status === 'initiated' || activeCall.status === 'ringing') {
        try {
          await cancelCall(activeCall._id);
          return;
        } catch (cancelErr: any) {
          // If cancel fails (e.g., status changed server-side), fall through to endCall
          console.warn('Cancel failed, trying endCall instead:', cancelErr.message);
        }
      }
      // Either the call was already accepted, or cancel failed - try endCall
      await endCall(activeCall._id);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMuted;
      });
    }
  };

  const toggleVideo = () => {
    const newDisabled = !isVideoEnabled;
    setIsVideoEnabled(newDisabled);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = newDisabled;
      });
    }
  };

  const toggleSpeaker = () => {
    const newSpeakerOn = !isSpeakerOn;
    setIsSpeakerOn(newSpeakerOn);
    // When speaker is ON, audio should NOT be muted (muted=false)
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !newSpeakerOn;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !newSpeakerOn;
    }
  };

  const handleToggleScreenShare = async () => {
    await toggleScreenShare();
  };

  const toggleFullscreen = async () => {
    // Use the video element for fullscreen for better mobile compatibility (iOS Safari)
    const element = remoteVideoRef.current || screenShareRef.current;
    if (!element) return;

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitEnterFullscreen) {
          // iOS Safari specific for video elements
          await (element as any).webkitEnterFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      setIsFullscreen(!isFullscreen);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Sync voiceScreenShareReady with isScreenSharing for voice calls
  useEffect(() => {
    setIsVoiceScreenShareReady(isScreenSharing);
  }, [isScreenSharing]);

  // Check if remote stream has video tracks (for screen share display on receiver side)
  useEffect(() => {
    const checkRemoteVideo = () => {
      if (remoteStreamRef.current) {
        const hasVideo = remoteStreamRef.current.getVideoTracks().length > 0;
        setHasRemoteVideo(hasVideo);
      }
    };
    checkRemoteVideo();
  }, [remoteStreamRef, remoteStreamVersion]);

  if (!activeCall) return null;

  const currentUserId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u._id || u.id || '';
    } catch { return ''; }
  })();
  const callerId = typeof activeCall.caller === 'object' ? activeCall.caller._id : activeCall.caller;
  const otherUser = currentUserId === callerId ? activeCall.receiver : activeCall.caller;
  const isVideo = activeCall.type === 'video';

  return (
    <div ref={callUiRef} className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      
      {/* Remote audio element (always present for voice calls) */}
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />

      {/* Video Call Layout */}
      {isVideo && activeCall.status === 'accepted' ? (
        <div className="relative z-10 w-full h-full">
          {/* Remote video (full screen) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* No remote stream placeholder */}
          {!remoteStreamRef.current && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-white text-lg">Waiting for video...</p>
              </div>
            </div>
          )}
          
          {/* Local video (picture-in-picture) */}
          <div className="absolute top-6 right-6 w-36 h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-800">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>

      {/* Top overlay - User info */}
          <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white font-medium">{otherUser.username}</span>
            <span className="text-white/60 text-sm">{formatDuration(callDuration)}</span>
          </div>

          {/* Bottom controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-5 max-w-md mx-auto">
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isMuted
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  !isVideoEnabled
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm'
                }`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>

              <button
                onClick={handleToggleScreenShare}
                disabled={activeCall.status !== 'accepted'}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  activeCall.status !== 'accepted'
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : isScreenSharing
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm'
                }`}
                title={activeCall.status !== 'accepted' ? 'Call must be accepted first' : isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
              >
                {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <MonitorUp className="w-6 h-6" />}
              </button>

              <button
                onClick={handleEndCall}
                className="w-18 h-18 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl hover:shadow-red-500/50 transition-all duration-200 hover:scale-110 p-5"
                title="End Call"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>

              <button
                onClick={toggleSpeaker}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSpeakerOn
                    ? 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm'
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-400'
                }`}
                title={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
              >
                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Voice Call / Connecting Layout */
        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full mx-auto p-8">
          {/* Top section - User info */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* Avatar with pulse ring */}
            <div className="relative mb-6">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.username}
                  className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl bg-gray-700 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Pulse ring animation when connecting */}
              {activeCall.status !== 'accepted' && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-green-400/50 animate-ping" />
                  <div className="absolute inset-[-8px] rounded-full border border-green-400/30 animate-pulse" />
                </>
              )}

              {/* Online indicator */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full" />
            </div>

            {/* User name */}
            <h2 className="text-3xl font-bold text-white mb-2">
              {otherUser.username}
            </h2>

            {/* Call status */}
            <p className="text-lg text-gray-400 mb-4">
              {activeCall.status === 'accepted' ? formatDuration(callDuration) : 
               activeCall.status === 'initiated' ? 'Calling...' : 'Connecting...'}
            </p>

            {/* Call type badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              {isVideo ? (
                <>
                  <Video className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white">Video Call</span>
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Voice Call</span>
                </>
              )}
            </div>
          </div>

          {/* Bottom section - Controls */}
          <div className="w-full max-w-md">
            {/* Control buttons */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isMuted
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* End call button */}
              <button
                onClick={handleEndCall}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-2xl hover:shadow-red-500/50 transition-all duration-200 hover:scale-110"
                title="End Call"
              >
                <PhoneOff className="w-10 h-10 text-white" />
              </button>

              {/* Screen share button */}
              <button
                onClick={handleToggleScreenShare}
                disabled={activeCall.status !== 'accepted'}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  activeCall.status !== 'accepted'
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : isScreenSharing || isVoiceScreenShareReady
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={activeCall.status !== 'accepted' ? 'Call must be accepted first' : isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
              >
                {isScreenSharing || isVoiceScreenShareReady ? <MonitorOff className="w-6 h-6" /> : <MonitorUp className="w-6 h-6" />}
              </button>

              {/* Speaker button */}
              <button
                onClick={toggleSpeaker}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSpeakerOn
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-400'
                }`}
                title={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
              >
                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
            </div>

            {/* Status text */}
            <p className="text-center text-sm text-gray-500">
              {isMuted ? 'Microphone muted' : 'Microphone active'}
              {isScreenSharing && ' • Screen sharing'}
            </p>

            {/* Remote screen share video (receiver sees this) - always rendered but hidden when no video */}
            <div className={`mt-4 w-full ${hasRemoteVideo && activeCall.status === 'accepted' ? '' : 'hidden'}`}>
              <div 
                ref={screenShareRef}
                className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900 aspect-video"
              >
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                {/* Screen share indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <MonitorUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-white font-medium">Receiving screen share</span>
                </div>
                {/* Fullscreen button for receiver */}
                <button
                  onClick={toggleFullscreen}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-2"
                  title="Expand screen share"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Expand</span>
                </button>
              </div>
            </div>

            {/* Screen share preview overlay during voice call (sharer sees this) - NO expand button for sender */}
            {isScreenSharing && activeCall.status === 'accepted' && (
              <div className="mt-4 w-full">
                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900 aspect-video">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                  {/* Screen share indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <MonitorUp className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white font-medium">Screen sharing</span>
                  </div>
                  {/* Stop screen sharing hint */}
                  <button
                    onClick={handleToggleScreenShare}
                    className="absolute bottom-3 right-3 bg-red-500/80 hover:bg-red-600 rounded-lg px-3 py-1.5 text-xs text-white font-medium transition-colors"
                    title="Stop sharing screen"
                  >
                    Stop sharing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
        
        /* Fullscreen styles for screen share container */
        div:fullscreen {
          background: black !important;
          padding: 0 !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        
        div:fullscreen > div {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          border-radius: 0 !important;
          border: none !important;
        }
        
        div:fullscreen video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
        
        /* Webkit fullscreen support */
        div:-webkit-full-screen {
          background: black !important;
          padding: 0 !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        
        div:-webkit-full-screen > div {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          border-radius: 0 !important;
          border: none !important;
        }
        
        div:-webkit-full-screen video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
        
        /* MS fullscreen support */
        div:-ms-fullscreen {
          background: black !important;
          padding: 0 !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        
        div:-ms-fullscreen > div {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          border-radius: 0 !important;
          border: none !important;
        }
        
        div:-ms-fullscreen video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
      `}</style>
    </div>
  );
}