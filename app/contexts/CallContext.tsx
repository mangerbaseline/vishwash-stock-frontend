'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

let remoteStreamVersionCounter = 0;

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
  remoteStreamVersion: number;
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
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const hasVideoSenderRef = useRef(false);
  const isScreenSharingRef = useRef(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteStreamVersion, setRemoteStreamVersion] = useState(0);

  const activeCallRef = useRef<Call | null>(null);
  const incomingCallRef = useRef<Call | null>(null);
  activeCallRef.current = activeCall;
  incomingCallRef.current = incomingCall;
  const currentUserIdRef = useRef<string | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const CALL_TIMEOUT_MS = 30000;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        currentUserIdRef.current = u._id || u.id;
      } catch (e) {
        console.error('Error parsing user in CallContext:', e);
      }
    }
  }, []);

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

  const createPeerConnection = useCallback(async (isCaller: boolean, callTypeOverride?: 'voice' | 'video') => {
    try {
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      const callType = callTypeOverride || activeCallRef.current?.type || 'voice';
      let stream: MediaStream;
      try {
        const needsVideo = callType === 'video';
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: needsVideo 
        });
      } catch (mediaError: any) {
        console.warn('❌ Initial getUserMedia failed, trying audio-only:', mediaError.name);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (audioError: any) {
          console.warn('❌ Audio-only getUserMedia also failed:', audioError.name);
          stream = new MediaStream();
          console.log('📞 Proceeding with empty media stream (no local mic/camera)');
        }
      }
      localStreamRef.current = stream;
      if (activeCallRef.current?.type === 'video') {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) originalVideoTrackRef.current = videoTrack;
      }

      stream.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
        }
      });

      pc.ontrack = (event) => {
        console.log('📡 Remote track received:', event.track.kind);
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        const existingTrackOfKind = remoteStreamRef.current.getTracks().find(t => t.kind === event.track.kind);
        if (existingTrackOfKind) {
          remoteStreamRef.current.removeTrack(existingTrackOfKind);
          existingTrackOfKind.stop();
        }
        event.streams[0].getTracks().forEach(track => {
          remoteStreamRef.current?.addTrack(track);
        });
        remoteStreamVersionCounter++;
        setRemoteStreamVersion(remoteStreamVersionCounter);
      };

      pc.onnegotiationneeded = async () => {
        console.log('🔄 Negotiation needed - creating offer for renegotiation');
        try {
          const call = activeCallRef.current || incomingCallRef.current;
          if (!call) return;
          const callerId = typeof call.caller === 'object' && call.caller ? call.caller._id : (call.caller as string);
          const receiverId = typeof call.receiver === 'object' && call.receiver ? call.receiver._id : (call.receiver as string);
          const currentUserId = currentUserIdRef.current;
          const targetUserId = currentUserId === callerId ? receiverId : callerId;
          if (!targetUserId) return;
          
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal(targetUserId, { sdp: offer.sdp, type: offer.type });
        } catch (err) {
          console.error('❌ Error in negotiationneeded:', err);
        }
      };

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

      pc.onconnectionstatechange = () => {
        console.log('📊 Connection state:', pc.connectionState);
        if ((pc.connectionState === 'disconnected' || pc.connectionState === 'failed') && !activeCallRef.current) {
          cleanupMedia();
        } else if (pc.connectionState === 'failed') {
          console.warn('⚠️ ICE connection failed - trying to recover');
        }
      };

      return pc;
    } catch (error) {
      console.error('❌ Error creating peer connection:', error);
      throw error;
    }
  }, []);

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
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    setIsScreenSharing(false);
    isScreenSharingRef.current = false;
    hasVideoSenderRef.current = false;
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

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

  const toggleScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current) {
      console.warn('🖥️ Cannot share screen: no peer connection');
      return;
    }
    if (!localStreamRef.current) {
      console.warn('🖥️ Cannot share screen: no local stream');
      return;
    }

    const currentlySharing = isScreenSharingRef.current;

    try {
      if (currentlySharing) {
        console.log('🖥️ Stopping screen share');
        if (screenTrackRef.current) {
          screenTrackRef.current.stop();
          screenTrackRef.current = null;
        }

        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');

        if (videoSender && originalVideoTrackRef.current) {
          await videoSender.replaceTrack(originalVideoTrackRef.current);
        } else if (videoSender && !originalVideoTrackRef.current) {
          peerConnectionRef.current.removeTrack(videoSender);
          hasVideoSenderRef.current = false;
        }

        const screenVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (screenVideoTrack) {
          localStreamRef.current.removeTrack(screenVideoTrack);
        }
        if (originalVideoTrackRef.current) {
          localStreamRef.current.addTrack(originalVideoTrackRef.current);
        }

        setIsScreenSharing(false);
        isScreenSharingRef.current = false;
      } else {
        console.log('🖥️ Starting screen share');
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false } as DisplayMediaStreamOptions);
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        screenTrack.onended = () => {
          console.log('🖥️ Screen sharing stopped via browser UI');
          if (screenTrackRef.current) {
            screenTrackRef.current.stop();
            screenTrackRef.current = null;
          }
          const senders = peerConnectionRef.current?.getSenders();
          const videoSender = senders?.find(s => s.track?.kind === 'video');
          if (videoSender && originalVideoTrackRef.current && peerConnectionRef.current) {
            videoSender.replaceTrack(originalVideoTrackRef.current);
          } else if (videoSender && peerConnectionRef.current) {
            peerConnectionRef.current.removeTrack(videoSender);
            hasVideoSenderRef.current = false;
          }
          if (localStreamRef.current) {
            const st = localStreamRef.current.getVideoTracks()[0];
            if (st) localStreamRef.current.removeTrack(st);
            if (originalVideoTrackRef.current) {
              localStreamRef.current.addTrack(originalVideoTrackRef.current);
            }
          }
          setIsScreenSharing(false);
          isScreenSharingRef.current = false;
        };

        const senders = peerConnectionRef.current.getSenders();
        let videoSender = senders.find(s => s.track?.kind === 'video');

        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        } else {
          videoSender = peerConnectionRef.current.addTrack(screenTrack, localStreamRef.current);
          hasVideoSenderRef.current = true;
        }

        const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (currentVideoTrack && currentVideoTrack !== originalVideoTrackRef.current) {
          localStreamRef.current.removeTrack(currentVideoTrack);
        } else if (currentVideoTrack) {
          localStreamRef.current.removeTrack(currentVideoTrack);
        }
        localStreamRef.current.addTrack(screenTrack);

        setIsScreenSharing(true);
        isScreenSharingRef.current = true;
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
      setIsScreenSharing(false);
      isScreenSharingRef.current = false;
    }
  }, []);

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
        playTone(523.25, 0, 0.15);
        playTone(659.25, 0.18, 0.15);
        playTone(783.99, 0.36, 0.2);
        playTone(659.25, 0.6, 0.15);
        playTone(783.99, 0.78, 0.25);
      };

      playRingPattern();
      ringtoneIntervalRef.current = setInterval(playRingPattern, 2000);
    } catch (error) {
      console.error('Error playing ringtone:', error);
    }
  }, []);

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
              playRingtone();
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
              if (data.call) {
                try {
                  const pc = await createPeerConnection(true);
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  const targetUserId = data.call.receiver._id || data.call.receiver;
                  sendSignal(targetUserId, { sdp: offer.sdp, type: offer.type });
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
              if (data.signal && data.signal.sdp) {
                try {
                  const incomingCallType = incomingCallRef.current?.type;
                  const pc = peerConnectionRef.current || await createPeerConnection(false, incomingCallType);
                  await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
                  
                  if (data.signal.type === 'offer') {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    sendSignal(data.senderId, { sdp: answer.sdp, type: answer.type });
                  }
                } catch (err) {
                  console.error('❌ Error handling signal:', err);
                }
              } else {
                console.warn('❌ Invalid signal - missing sdp:', data);
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
  }, []);

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to initiate call:', response.status, errorText);
        throw new Error('Failed to initiate call');
      }

      const data = await response.json();
      if (data.success) {
        setActiveCall(data.call);
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
        activeCallRef.current = data.call;
        incomingCallRef.current = null;
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
      remoteStreamVersion,
      isScreenSharing,
      toggleScreenShare
    }}>
      {children}
    </CallContext.Provider>
  );
};