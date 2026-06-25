'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface Call {
  _id: string;
  caller: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  type: 'voice' | 'video';
  status: 'initiated' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed' | 'cancelled';
  conversationId?: string;
  roomId?: string;
  isRoomCall?: boolean;
  participants?: string[];
  startedAt: string;
  endedAt?: string;
  duration?: number;
}

interface CallContextType {
  activeCall: Call | null;
  incomingCall: Call | null;
  callHistory: Call[];
  loading: boolean;
  initiateCall: (receiverId: string, type: 'voice' | 'video', conversationId?: string, roomId?: string, isRoomCall?: boolean, participants?: string[]) => Promise<void>;
  acceptCall: (callId: string) => Promise<void>;
  rejectCall: (callId: string) => Promise<void>;
  endCall: (callId: string) => Promise<void>;
  cancelCall: (callId: string) => Promise<void>;
  fetchCallHistory: () => Promise<void>;
  setIncomingCall: (call: Call | null) => void;
  localStreamRef: React.RefObject<MediaStream | null>;
  remoteStreamRef: React.RefObject<MediaStream | null>;
  isScreenSharing: boolean;
  toggleScreenShare: () => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [callHistory, setCallHistory] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Refs to hold latest state values for WebSocket callbacks (avoid stale closures)
  const activeCallRef = useRef<Call | null>(null);
  const incomingCallRef = useRef<Call | null>(null);
  activeCallRef.current = activeCall;
  incomingCallRef.current = incomingCall;
  const currentUserIdRef = useRef<string | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const CALL_TIMEOUT_MS = 30000; // 30 seconds auto-miss/cancel

  // Load user ID from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        currentUserIdRef.current = u._id || u.id;
        console.log('👤 Loaded current user ID in CallContext:', currentUserIdRef.current);
      } catch (e) {
        console.error('Error parsing user in CallContext:', e);
      }
    }
  }, []);

  // WebRTC configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };

  // Create a peer connection and set up event handlers
  const createPeerConnection = useCallback(async (isCaller: boolean) => {
    try {
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: activeCallRef.current?.type === 'video' });
      localStreamRef.current = stream;
      if (activeCallRef.current?.type === 'video') {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) originalVideoTrackRef.current = videoTrack;
      }

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log('📡 Remote track received:', event.track.kind);
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        event.streams[0].getTracks().forEach(track => {
          remoteStreamRef.current?.addTrack(track);
        });
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          const call = activeCallRef.current || incomingCallRef.current;
          let targetUserId: string | null = null;
          if (call) {
            const callerId = typeof call.caller === 'object' && call.caller ? call.caller._id : (call.caller as string);
            const receiverId = typeof call.receiver === 'object' && call.receiver ? call.receiver._id : (call.receiver as string);
            const currentUserId = currentUserIdRef.current;
            targetUserId = currentUserId === callerId ? receiverId : callerId;
          }

          if (targetUserId) {
            wsRef.current.send(JSON.stringify({
              type: 'ice_candidate',
              callId: call?._id,
              targetUserId,
              candidate: event.candidate
            }));
          }
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('📊 Connection state:', pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          cleanupMedia();
        }
      };

      return pc;
    } catch (error) {
      console.error('❌ Error creating peer connection:', error);
      throw error;
    }
  }, []); // No dependencies - use refs instead

  // Clean up media streams and peer connection
  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
    if (originalVideoTrackRef.current) {
      originalVideoTrackRef.current.stop();
      originalVideoTrackRef.current = null;
    }
    setIsScreenSharing(false);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  // Send WebRTC signal via WebSocket
  const sendSignal = useCallback(async (targetUserId: string, signal: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const call = activeCallRef.current || incomingCallRef.current;
      wsRef.current.send(JSON.stringify({
        type: 'call_signal',
        callId: call?._id,
        targetUserId,
        signal
      }));
    }
  }, []);

  // Screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current || !localStreamRef.current) return;

    try {
      if (isScreenSharing) {
        // Stop screen sharing and revert to camera
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        
        if (videoSender && originalVideoTrackRef.current) {
          await videoSender.replaceTrack(originalVideoTrackRef.current);
          
          // Remove screen track from local stream and add camera track
          const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (currentVideoTrack) {
            currentVideoTrack.stop();
            localStreamRef.current.removeTrack(currentVideoTrack);
          }
          localStreamRef.current.addTrack(originalVideoTrackRef.current);
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        screenTrack.onended = () => {
          // If user stops sharing via browser UI, toggle back
          toggleScreenShare();
        };

        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        
        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
          
          // Update local stream to show screen share
          const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (currentVideoTrack) {
            localStreamRef.current.removeTrack(currentVideoTrack);
          }
          localStreamRef.current.addTrack(screenTrack);
        }
        setIsScreenSharing(true);
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

  // ── Ringtone & timeout helpers (defined BEFORE WebSocket useEffect) ──
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneAudioCtxRef = useRef<AudioContext | null>(null);

  const stopRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (ringtoneAudioCtxRef.current) {
      ringtoneAudioCtxRef.current.close().catch(() => {});
      ringtoneAudioCtxRef.current = null;
    }
  }, []);

  const clearCallTimeout = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
  }, []);

  const playRingtone = useCallback(() => {
    // stop any existing ringtone first
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (ringtoneAudioCtxRef.current) {
      ringtoneAudioCtxRef.current.close().catch(() => {});
      ringtoneAudioCtxRef.current = null;
    }
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      ringtoneAudioCtxRef.current = audioContext;

      const playTone = (freq: number, startOffset: number, duration: number) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const t = audioContext.currentTime + startOffset;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + duration);
        osc.start(t);
        osc.stop(t + duration);
      };

      const playRingPattern = () => {
        if (!ringtoneAudioCtxRef.current) return;
        playTone(523.25, 0, 0.15);    // C5
        playTone(659.25, 0.18, 0.15); // E5
        playTone(783.99, 0.36, 0.2);  // G5
        playTone(659.25, 0.6, 0.15);  // E5
        playTone(783.99, 0.78, 0.25); // G5
      };

      playRingPattern();
      ringtoneIntervalRef.current = setInterval(playRingPattern, 2000);
    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  }, []);

  // Stable refs so WebSocket closure always has latest version
  const playRingtoneRef = useRef(playRingtone);
  const stopRingtoneRef = useRef(stopRingtone);
  const clearCallTimeoutRef = useRef(clearCallTimeout);
  playRingtoneRef.current = playRingtone;
  stopRingtoneRef.current = stopRingtone;
  clearCallTimeoutRef.current = clearCallTimeout;


  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const connect = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found for WebSocket');
        return;
      }

      const wsUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/^http/, 'ws');
      console.log('📞 Connecting to WebSocket:', `${wsUrl}/ws/calls`);
      
      ws = new WebSocket(`${wsUrl}/ws/calls`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Call WebSocket connected successfully');
        if (ws) {
          ws.send(JSON.stringify({ type: 'AUTH', token }));
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Call WebSocket connection error:', error);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data.type, data);
          
          switch (data.type) {
            case 'AUTH_SUCCESS':
              console.log('✅ Call WebSocket authenticated');
              if (data.userId) {
                currentUserIdRef.current = data.userId.toString();
              }
              break;
              
            case 'incoming_call':
              console.log('📞 INCOMING CALL RECEIVED:', data);
              // Map WebSocket data to Call interface (WebSocket sends callId, interface expects _id)
              const incomingCallData: Call = {
                _id: data.callId || data._id,
                caller: data.caller || data.callerId,
                receiver: data.receiver || { _id: currentUserIdRef.current || '' },
                type: data.callType || 'voice',
                status: 'initiated',
                conversationId: data.conversationId,
                roomId: data.roomId,
                isRoomCall: data.isRoomCall,
                participants: data.participants,
                startedAt: data.startedAt || new Date().toISOString()
              };
              setIncomingCall(incomingCallData);
              // Play ringtone
              playRingtone();
              // Auto-miss timeout: if not accepted within 30s, mark as missed
              clearCallTimeout();
              callTimeoutRef.current = setTimeout(async () => {
                if (incomingCallRef.current && incomingCallRef.current._id === incomingCallData._id) {
                  console.log('⏰ Call auto-missed after timeout');
                  try {
                    const token = localStorage.getItem('token');
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    await fetch(`${apiUrl}/api/calls/missed/${incomingCallData._id}`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                  } catch (err) {
                    console.error('Error auto-marking call as missed:', err);
                  }
                  setIncomingCall(null);
                  stopRingtone();
                  fetchCallHistory();
                }
              }, CALL_TIMEOUT_MS);
              break;
              
            case 'call_accepted':
              console.log('✅ Call accepted:', data);
              clearCallTimeout();
              setActiveCall(prev => prev ? { ...prev, status: 'accepted' } : null);
              // As the caller, create peer connection and send offer
              if (data.call) {
                try {
                  const pc = await createPeerConnection(true);
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  const targetUserId = data.call.receiver._id || data.call.receiver;
                  sendSignal(targetUserId, { sdp: offer });
                } catch (err) {
                  console.error('❌ Error creating offer:', err);
                }
              }
              break;
              
            case 'call_rejected':
              console.log('❌ Call rejected:', data);
              clearCallTimeout();
              setActiveCall(null);
              setIncomingCall(null);
              cleanupMedia();
              fetchCallHistory();
              break;
              
            case 'call_ended':
              console.log('📞 Call ended:', data);
              clearCallTimeout();
              setActiveCall(null);
              setIncomingCall(null);
              cleanupMedia();
              fetchCallHistory();
              break;
              
            case 'call_cancelled':
              console.log('🚫 Call cancelled:', data);
              clearCallTimeout();
              setIncomingCall(null);
              cleanupMedia();
              stopRingtone();
              fetchCallHistory();
              break;
              
            case 'call_status_changed':
              console.log('📊 Call status changed:', data);
              if (data.call) {
                setActiveCall(data.call);
              }
              break;

            case 'call_signal':
              console.log('📡 WebRTC signal received:', data.signal?.type);
              // Handle incoming WebRTC signal
              if (data.signal?.sdp) {
                try {
                  const pc = peerConnectionRef.current || await createPeerConnection(false);
                  await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
                  
                  // If it's an offer, create an answer
                  if (data.signal.sdp.type === 'offer') {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    sendSignal(data.senderId, { sdp: answer });
                  }
                } catch (err) {
                  console.error('❌ Error handling signal:', err);
                }
              }
              break;

            case 'ice_candidate':
              console.log('🧊 ICE candidate received');
              if (data.candidate && peerConnectionRef.current) {
                try {
                  await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                  console.error('❌ Error adding ICE candidate:', err);
                }
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('📞 Call WebSocket disconnected:', event.code, event.reason);
        // Auto-reconnect after 3 seconds if not intentional close and still mounted
        if (event.code !== 1000 && isMounted) {
          console.log('🔄 Reconnecting Call WebSocket in 3s...');
          reconnectTimeoutId = setTimeout(() => {
            if (isMounted) {
              connect();
            }
          }, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      cleanupMedia();
    };
  }, []); // Empty deps - WebSocket connects and handles auto-reconnect


  const initiateCall = useCallback(async (
    receiverId: string,
    type: 'voice' | 'video',
    conversationId?: string,
    roomId?: string,
    isRoomCall?: boolean,
    participants?: string[]
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      console.log('📞 Initiating call:', { receiverId, type, conversationId });
      
      const response = await fetch(`${apiUrl}/api/calls/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId,
          type,
          conversationId,
          roomId,
          isRoomCall,
          participants
        })
      });

      console.log('📞 Call initiation response:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to initiate call:', response.status, errorText);
        throw new Error('Failed to initiate call');
      }

      const data = await response.json();
      console.log('📞 Call initiation success:', data);
      if (data.success) {
        setActiveCall(data.call);
        // Auto-cancel timeout: if not accepted in 30s, cancel the call
        clearCallTimeout();
        callTimeoutRef.current = setTimeout(async () => {
          if (activeCallRef.current && activeCallRef.current._id === data.call._id && 
              (activeCallRef.current.status === 'initiated' || activeCallRef.current.status === 'ringing')) {
            console.log('⏰ Call auto-cancelled after timeout (no answer)');
            try {
              await cancelCall(data.call._id);
            } catch (err) {
              console.error('Error auto-cancelling call:', err);
            }
            fetchCallHistory();
          }
        }, CALL_TIMEOUT_MS);
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptCall = useCallback(async (callId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      console.log('✅ Accepting call:', callId);
      
      const response = await fetch(`${apiUrl}/api/calls/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ callId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to accept call:', response.status, errorText);
        throw new Error('Failed to accept call');
      }

      const data = await response.json();
      if (data.success) {
        clearCallTimeout();
        stopRingtone();
        setActiveCall(data.call);
        setIncomingCall(null);
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectCall = useCallback(async (callId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      console.log('❌ Rejecting call:', callId);
      
      const response = await fetch(`${apiUrl}/api/calls/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ callId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to reject call:', response.status, errorText);
        throw new Error('Failed to reject call');
      }

      clearCallTimeout();
      stopRingtone();
      setIncomingCall(null);
      fetchCallHistory();
    } catch (error) {
      console.error('Error rejecting call:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const endCall = useCallback(async (callId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/calls/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ callId })
      });

      if (!response.ok) {
        throw new Error('Failed to end call');
      }

      setActiveCall(null);
      // Refresh call history
      fetchCallHistory();
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelCall = useCallback(async (callId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/calls/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ callId })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel call');
      }

      setActiveCall(null);
    } catch (error) {
      console.error('Error cancelling call:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCallHistory = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/calls/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCallHistory(data.calls);
        }
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <CallContext.Provider value={{
      activeCall,
      incomingCall,
      callHistory,
      loading,
      initiateCall,
      acceptCall,
      rejectCall,
      endCall,
      cancelCall,
      fetchCallHistory,
      setIncomingCall,
      localStreamRef,
      remoteStreamRef,
      isScreenSharing,
      toggleScreenShare
    }}>
      {children}
    </CallContext.Provider>
  );
};