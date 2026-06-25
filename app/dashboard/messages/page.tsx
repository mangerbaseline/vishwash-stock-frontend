'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Send, MessageCircle, Users, Search,
    Check, CheckCheck, Clock, ChevronLeft, ChevronRight,
    Shield, AlertCircle, X, Plus, Settings,
    Hash, Megaphone, Loader2, ChevronDown, Phone, Video,
    History
} from 'lucide-react';
import { messageApi } from '../../lib/messageApi';
import { useToast, ToastContainer } from '../../components/ui/toast';
import CallButton from '@/app/components/CallButton';
import { useCall } from '@/app/contexts/CallContext';

// Interfaces
interface User {
    _id: string;
    username: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: Date;
}

interface Message {
    _id: string;
    sender: User;
    senderName: string;
    senderRole: string;
    content: string;
    messageType: 'text' | 'image' | 'file' | 'system';
    attachments?: Array<{
        url: string;
        filename: string;
        filetype: string;
        size: number;
    }>;
    room: string;
    isPrivate: boolean;
    readBy: Array<{ user: User; readAt: Date }>;
    reactions: Array<{ user: User; emoji: string; createdAt: Date }>;
    replyTo?: Message;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: string;
}

interface Conversation {
    _id: string;
    participants: string[];
    participantDetails: Array<{
        userId: User;
        name: string;
        role: string;
        lastSeen?: Date;
    }>;
    isGroup: boolean;
    groupName?: string;
    groupAvatar?: string;
    lastMessage?: Message;
    lastMessageContent?: string;
    lastMessageTime?: Date;
    lastMessageSender?: string;
    unreadCount: number;
    room: string;
}

// Cache for conversations
let conversationsCache: Conversation[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

export default function MessagesPage() {
    const router = useRouter();
    const { addToast, toasts, removeToast } = useToast();
    const { callHistory, fetchCallHistory, initiateCall } = useCall();

    // Use useRef for values that don't need re-renders
    const mounted = useRef(true);
    const loadingRef = useRef(false);

    // Combine related states
    const [user, setUser] = useState<User | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [selectedRoom, setSelectedRoom] = useState<string>('general');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [searchUsers, setSearchUsers] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isGroupChat, setIsGroupChat] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Date | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showCallHistory, setShowCallHistory] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<NodeJS.Timeout>();
    const prevMessagesLengthRef = useRef<number>(0);
    const headerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    // Refs for polling to avoid stale closures
    const fetchRoomMessagesRef = useRef<(roomName: string) => Promise<void>>(async () => {});
    const selectedRoomRef = useRef<string>('general');

    // Memoize rooms based on user role
    const rooms = useMemo(() => {
        const userRole = user?.role || 'user';
        const baseRooms = [
            { id: 'general', name: 'General Chat', icon: Hash, description: 'General discussion for everyone' }
        ];

        if (userRole === 'admin' || userRole === 'super_admin') {
            baseRooms.push(
                { id: 'announcements', name: 'Announcements', icon: Megaphone, description: 'Official announcements' },
                { id: 'admin-chat', name: 'Admin Chat', icon: Shield, description: 'Private admin discussion' }
            );
        }

        if (userRole === 'super_admin') {
            baseRooms.push({ id: 'system', name: 'System', icon: Settings, description: 'System logs and alerts' });
        }

        return baseRooms;
    }, [user?.role]);

    const checkIfAtBottom = useCallback(() => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
    }, []);

    const scrollToBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            setIsAtBottom(true);
        }
    }, []);

    const handleScroll = useCallback(() => {
        checkIfAtBottom();
    }, [checkIfAtBottom]);

    useEffect(() => {
        const messagesContainer = messagesContainerRef.current;
        if (messagesContainer) {
            messagesContainer.addEventListener('scroll', handleScroll);
            return () => messagesContainer.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    useEffect(() => {
        if (messages.length > prevMessagesLengthRef.current && isAtBottom) scrollToBottom();
        prevMessagesLengthRef.current = messages.length;
    }, [messages, isAtBottom, scrollToBottom]);

    const fetchRoomMessages = useCallback(async (roomName: string) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/messages/room/${roomName}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch messages for room ${roomName}: ${response.status}`, errorText);
                throw new Error(`Failed to fetch messages: ${response.status}`);
            }
            const data = await response.json();
            const sortedMessages = (data.messages || []).sort((a: Message, b: Message) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setMessages(sortedMessages);
            setTimeout(scrollToBottom, 100);
            if (sortedMessages.length > 0) setLastMessageTimestamp(new Date(sortedMessages[sortedMessages.length - 1].createdAt));
        } catch (error) { console.error('Error fetching room messages:', error); }
    }, [scrollToBottom]);

    // Update refs whenever fetchRoomMessages or selectedRoom changes
    fetchRoomMessagesRef.current = fetchRoomMessages;
    selectedRoomRef.current = selectedRoom;

    // Polling for new messages in rooms (only when tab is visible)
    useEffect(() => {
        if (selectedRoom && !currentConversation) {
            const interval = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    const room = selectedRoomRef.current;
                    if (room) {
                        fetchRoomMessagesRef.current(room);
                    }
                }
            }, 5000);
            setPollingInterval(interval);
            return () => {
                if (interval) clearInterval(interval);
            };
        }
    }, [selectedRoom, currentConversation]);

    // Initialize - run once and in parallel
    useEffect(() => {
        mounted.current = true;

        const init = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/Authentication/signin');
                    return;
                }

                const [userData, conversationsData] = await Promise.allSettled([
                    fetchUserData(token),
                    fetchConversations(token),
                    fetchCallHistory()
                ]);

                if (userData.status === 'fulfilled' && userData.value) {
                    setUser(userData.value);
                }

                if (conversationsData.status === 'fulfilled' && conversationsData.value) {
                    setConversations(conversationsData.value);
                }

                await fetchRoomMessages('general');

            } catch (error) {
                console.error('Init error:', error);
            } finally {
                if (mounted.current) setLoading(false);
            }
        };

        init();

        return () => {
            mounted.current = false;
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, []);

    const fetchUserData = async (token: string): Promise<User | null> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (response.ok) { const data = await response.json(); return data.user; }
        } catch (error) { console.error('Error fetching user:', error); }
        return null;
    };

    const fetchConversations = async (token: string): Promise<Conversation[]> => {
        if (conversationsCache && Date.now() - cacheTimestamp < CACHE_DURATION) return conversationsCache!;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/messages/conversations`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                conversationsCache = data.conversations || [];
                cacheTimestamp = Date.now();
                return conversationsCache!;
            }
        } catch (error) { console.error('Error fetching conversations:', error); }
        return [];
    };

    const searchForUsers = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) { setUserSearchResults([]); return; }
        setSearchingUsers(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/users/search?q=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setUserSearchResults(data.users || []);
        } catch (error) {
            console.error('Error searching users:', error);
            setUserSearchResults([]);
        } finally { setSearchingUsers(false); }
    }, []);

    const createNewConversation = async () => {
        if (selectedUsers.length === 0) { addToast('Please select at least one user', 'error'); return; }
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/messages/conversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participants: selectedUsers.map(u => u._id),
                    isGroup: isGroupChat,
                    groupName: isGroupChat ? groupName : undefined
                })
            });
            if (response.ok) {
                const newConv = await response.json();
                setConversations(prev => {
                    const exists = prev.some(c => c._id === newConv.conversation._id);
                    if (exists) {
                        return [newConv.conversation, ...prev.filter(c => c._id !== newConv.conversation._id)];
                    }
                    return [newConv.conversation, ...prev];
                });
                setCurrentConversation(newConv.conversation);
                setSelectedRoom('');
                setShowNewChatModal(false);
                resetNewChatForm();
                addToast(newConv.existing ? 'Opening existing conversation' : 'Conversation created', 'success');
                conversationsCache = null;
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            addToast('Failed to create conversation', 'error');
        }
    };

    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            const response = await messageApi.getMessages(conversationId);
            const sortedMessages = (response.messages || []).sort((a: Message, b: Message) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setMessages(sortedMessages);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [scrollToBottom]);

    const markAsRead = useCallback(async (conversationId: string) => {
        try {
            await messageApi.markAsRead(conversationId);
            setConversations(prev => prev.map(c => c._id === conversationId ? { ...c, unreadCount: 0 } : c));
        } catch (error) { console.error('Error marking as read:', error); }
    }, []);

    const sendPrivateMessage = async () => {
        if (!messageInput.trim() || sending || !currentConversation) return;
        setSending(true);
        try {
            const response = await messageApi.sendMessage({
                content: messageInput,
                room: currentConversation.room,
                recipients: currentConversation.isGroup ? undefined : currentConversation.participants,
                replyTo: replyingTo?._id
            });
            // Optimistically update message status to show as sent
            const optimisticMessage = {
                ...response.message,
                readBy: response.message.readBy || [{ user: user!._id, readAt: new Date() }]
            };
            setMessages(prev => [...prev, optimisticMessage]);
            setMessageInput('');
            setReplyingTo(null);
            setTimeout(scrollToBottom, 50);
            setConversations(prev => prev.map(c => c._id === currentConversation._id ? {
                ...c, lastMessage: response.message, lastMessageContent: messageInput, lastMessageTime: new Date(), lastMessageSender: user?.username
            } : c).sort((a, b) => {
                const timeA = a.lastMessageTime instanceof Date ? a.lastMessageTime.getTime() : new Date(a.lastMessageTime || 0).getTime();
                const timeB = b.lastMessageTime instanceof Date ? b.lastMessageTime.getTime() : new Date(b.lastMessageTime || 0).getTime();
                return timeB - timeA;
            }));
        } catch (error) {
            console.error('Error sending message:', error);
            addToast('Failed to send message', 'error');
        } finally { setSending(false); }
    };

    const sendRoomMessage = async () => {
        if (!messageInput.trim() || sending || !selectedRoom) return;
        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/messages/room/${selectedRoom}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: messageInput, replyTo: replyingTo?._id })
            });
            if (response.ok) {
                const data = await response.json();
                // Optimistically update message status to show as sent
                const optimisticMessage = {
                    ...data.message,
                    readBy: data.message.readBy || [{ user: user!._id, readAt: new Date() }]
                };
                setMessages(prev => [...prev, optimisticMessage]);
                setMessageInput('');
                setReplyingTo(null);
                setTimeout(scrollToBottom, 50);
                setTimeout(() => fetchRoomMessages(selectedRoom), 100);
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error sending room message:', error);
            addToast(error instanceof Error ? error.message : 'Failed to send message', 'error');
        } finally { setSending(false); }
    };

    const handleSendMessage = () => {
        if (currentConversation) sendPrivateMessage();
        else if (selectedRoom) sendRoomMessage();
    };

    const handleMessageInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageInput(e.target.value);

    useEffect(() => {
        if (currentConversation) {
            fetchMessages(currentConversation._id);
            markAsRead(currentConversation._id);
        }
    }, [currentConversation?._id]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };

    const resetNewChatForm = () => {
        setSelectedUsers([]); setIsGroupChat(false); setGroupName(''); setSearchUsers(''); setUserSearchResults([]);
    };

    // Helper to get userId as string (handles both populated and lean objects)
    const getUserId = (userId: any): string => {
        if (!userId) return '';
        if (typeof userId === 'object' && userId._id) return userId._id.toString();
        return userId.toString();
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => {
            if (!searchTerm) return true;
            const otherName = c.participantDetails?.find(p => getUserId(p.userId) !== user?._id)?.name || '';
            const groupName = c.groupName || '';
            return otherName.toLowerCase().includes(searchTerm.toLowerCase()) || groupName.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [conversations, searchTerm, user?._id]);

    const formatTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getMessageStatus = (message: Message): JSX.Element | null => {
        if (message.sender?._id !== user?._id) return null;
        // If message has been read by more than 1 person (sender + at least one other)
        if (message.readBy && message.readBy.length > 1) return <CheckCheck className="w-4 h-4 text-blue-500" />;
        // If message has been sent (readBy includes sender or message is from current user)
        if (message.readBy && message.readBy.length === 1) return <Check className="w-4 h-4 text-gray-500" />;
        // If no readBy data but message is from current user, assume sent
        if (!message.readBy && message.sender?._id === user?._id) return <Check className="w-4 h-4 text-gray-500" />;
        return <Clock className="w-4 h-4 text-gray-500" />;
    };

    const getAvatar = (participant: any): JSX.Element => {
        if (!participant) return (<div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">?</div>);
        const userData = participant.userId || participant;
        if (userData.avatar) return <img src={userData.avatar} alt={participant.name || userData.username} className="w-10 h-10 rounded-full object-cover" />;
        const colors: { [key: string]: string } = { user: 'bg-green-500', admin: 'bg-blue-500', super_admin: 'bg-purple-500' };
        const role = userData.role || participant.role || 'user';
        const name = participant.name || userData.username || 'U';
        return (<div className={`w-10 h-10 rounded-full ${colors[role] || 'bg-gray-500'} flex items-center justify-center text-white font-bold`}>{name.charAt(0).toUpperCase()}</div>);
    };

    const getRoleBadge = (role: string): JSX.Element => {
        switch (role) {
            case 'super_admin': return <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">SA</span>;
            case 'admin': return <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">A</span>;
            default: return <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">U</span>;
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="relative mx-auto w-16 h-16 mb-4">
                        <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <MessageCircle className="absolute inset-0 m-auto w-6 h-6 text-indigo-600 animate-pulse" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
                </div>
            </div>
        );
    }

    const showChat = currentConversation || selectedRoom;

    return (
        <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            {/* Sidebar */}
            <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-indigo-600" />
                            Messages
                        </h2>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    setShowCallHistory(!showCallHistory);
                                    if (!showCallHistory) {
                                        setCurrentConversation(null);
                                        setSelectedRoom('');
                                        fetchCallHistory();
                                    }
                                }}
                                className={`p-2 rounded-lg transition-all duration-200 ${showCallHistory ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                title="Call History"
                            >
                                <History className="w-5 h-5" />
                            </button>
                            <button onClick={() => setShowNewChatModal(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="New Chat">
                                <Plus className="w-5 h-5" />
                            </button>
                            <button onClick={() => setShowSidebar(false)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search conversations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>

                {/* Rooms */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Chat Rooms</h3>
                    <div className="space-y-1">
                        {rooms.map((room) => {
                            const Icon = room.icon;
                            const isActive = selectedRoom === room.id && !currentConversation;
                            return (
                                <button key={room.id} onClick={() => { setSelectedRoom(room.id); setCurrentConversation(null); setShowCallHistory(false); setMessages([]); fetchRoomMessages(room.id); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                    <Icon className="w-5 h-5" />
                                    <div className="flex-1 text-left">
                                        <span className="text-sm font-medium block">{room.name}</span>
                                        <span className="text-xs text-gray-500">{room.description}</span>
                                    </div>
                                    {isActive && <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Private Chats</h3>
                    <div className="space-y-2">
                        {filteredConversations.length > 0 ? filteredConversations.map((conversation) => {
                            const otherParticipant = conversation.participantDetails?.find(p => getUserId(p.userId) !== user?._id);
                            return (
                                <button key={conversation._id} onClick={() => { setCurrentConversation(conversation); setSelectedRoom(''); setShowCallHistory(false); fetchMessages(conversation._id); }} className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${currentConversation?._id === conversation._id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                    <div className="relative">
                                        {getAvatar(otherParticipant)}
                                        {onlineUsers.has(getUserId(otherParticipant?.userId)) && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{otherParticipant?.name || 'Unknown User'}</p>
                                            {conversation.lastMessageTime && <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime.toString())}</span>}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conversation.lastMessageContent || 'No messages'}</p>
                                            {conversation.unreadCount > 0 && <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full min-w-[20px] text-center">{conversation.unreadCount}</span>}
                                        </div>
                                    </div>
                                </button>
                            );
                        }) : <p className="text-center text-gray-500 py-4 text-sm">No private chats yet</p>}
                    </div>
                </div>

                {/* User Info */}
                {user && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            {getAvatar({ userId: user, name: user.username, role: user.role })}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.username}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            {getRoleBadge(user.role)}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-screen overflow-hidden">
                {showCallHistory ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Call History Header */}
                        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                    <History className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Call History</h3>
                                    <p className="text-xs text-gray-500">View and manage your recent voice and video calls</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchCallHistory}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-500 transition-colors"
                                title="Refresh"
                            >
                                <History className="w-4 h-4 hover:rotate-180 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Call History List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {callHistory && callHistory.length > 0 ? (
                                <div className="max-w-4xl mx-auto space-y-3">
                                    {callHistory.map((call, index) => {
                                        const isOutbound = call.caller?._id === user?._id;
                                        const otherParty = isOutbound ? call.receiver : call.caller;
                                        if (!otherParty) return null;

                                        const TypeIcon = call.type === 'video' ? Video : Phone;

                                        let statusColor = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                                        let statusText: string = call.status;
                                        
                                        if (call.status === 'accepted' || call.status === 'ended') {
                                            statusColor = 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400';
                                            statusText = isOutbound ? 'Outbound' : 'Inbound';
                                        } else if (call.status === 'missed') {
                                            statusColor = 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
                                            statusText = 'Missed';
                                        } else if (call.status === 'rejected') {
                                            statusColor = 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400';
                                            statusText = 'Rejected';
                                        } else if (call.status === 'cancelled') {
                                            statusColor = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                                            statusText = 'Cancelled';
                                        }

                                        const formatDuration = (sec?: number) => {
                                            if (!sec) return '0s';
                                            const mins = Math.floor(sec / 60);
                                            const secs = sec % 60;
                                            return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                                        };

                                        return (
                                            <div
                                                key={`${call._id}-${index}`}
                                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-md dark:hover:shadow-indigo-950/10 hover:border-indigo-100 dark:hover:border-indigo-950 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        {getAvatar(otherParty)}
                                                        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center">
                                                            <TypeIcon className="w-3.5 h-3.5 text-gray-500" />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-gray-900 dark:text-white">{otherParty.username}</p>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                                                                {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                                                            <span>{new Date(call.startedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                            {call.duration !== undefined && call.duration > 0 && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{formatDuration(call.duration)}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => initiateCall(otherParty._id, 'voice')}
                                                        className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow hover:shadow-md transition-all hover:scale-105 flex items-center justify-center"
                                                        title="Voice Call"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => initiateCall(otherParty._id, 'video')}
                                                        className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow hover:shadow-md transition-all hover:scale-105 flex items-center justify-center"
                                                        title="Video Call"
                                                    >
                                                        <Video className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                    <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 mb-4 animate-pulse">
                                        <History className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Call History</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm px-4">Calls you make and receive will appear here. Start a call by selecting a chat and clicking the call button.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : showChat ? (
                    <>
                        {/* Chat Header */}
                        <div ref={headerRef} className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {!showSidebar && (
                                    <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                                {selectedRoom && !currentConversation ? (
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                                        <Hash className="w-5 h-5 text-indigo-600" />
                                    </div>
                                ) : currentConversation && (() => {
                                    const otherParticipant = currentConversation.participantDetails?.find(p => getUserId(p.userId) !== user?._id);
                                    return getAvatar(otherParticipant);
                                })()}
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {selectedRoom && !currentConversation ? rooms.find(r => r.id === selectedRoom)?.name || selectedRoom : currentConversation?.groupName || currentConversation?.participantDetails?.find(p => getUserId(p.userId) !== user?._id)?.name || 'Chat'}
                                    </h3>
                                    {selectedRoom && !currentConversation && <p className="text-xs text-gray-500">{rooms.find(r => r.id === selectedRoom)?.description}</p>}
                                </div>
                            </div>
                            {selectedRoom && !currentConversation && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Users className="w-4 h-4" />
                                    <span>Everyone can chat here</span>
                                </div>
                            )}
                            
                            {/* Call Buttons */}
                            {(currentConversation || selectedRoom) && (
                                <div className="flex items-center gap-2">
                                    {currentConversation && (
                                        <>
                                            <CallButton
                                                receiverId={currentConversation.participants.find(p => p !== user?._id) || ''}
                                                type="voice"
                                                conversationId={currentConversation._id}
                                                className="p-2"
                                            />
                                            <CallButton
                                                receiverId={currentConversation.participants.find(p => p !== user?._id) || ''}
                                                type="video"
                                                conversationId={currentConversation._id}
                                                className="p-2"
                                            />
                                        </>
                                    )}
                                    {selectedRoom && !currentConversation && user && (
                                        <>
                                            <CallButton
                                                receiverId={user._id}
                                                type="voice"
                                                roomId={selectedRoom}
                                                isRoomCall={true}
                                                participants={[user._id]}
                                                className="p-2"
                                                showLabel={false}
                                            />
                                            <CallButton
                                                receiverId={user._id}
                                                type="video"
                                                roomId={selectedRoom}
                                                isRoomCall={true}
                                                participants={[user._id]}
                                                className="p-2"
                                                showLabel={false}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Messages Container */}
                        <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 flex flex-col" style={{ scrollBehavior: 'smooth' }}>
                            {messages.length > 0 ? messages.map((message, index) => {
                                if (!message || !message.sender) return null;
                                const isOwn = message.sender._id === user?._id;
                                const showAvatar = index === 0 || messages[index - 1]?.sender?._id !== message.sender._id;
                                return (
                                    <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                            {!isOwn && showAvatar && (
                                                <div className="flex-shrink-0">{getAvatar({ userId: message.sender, name: message.senderName || message.sender.username, role: message.senderRole || message.sender.role })}</div>
                                            )}
                                            <div>
                                                {!isOwn && selectedRoom && !currentConversation && (
                                                    <p className="text-xs text-gray-500 mb-1 ml-1">{message.senderName || message.sender.username}{message.sender.role === 'admin' && ' 👑'}{message.sender.role === 'super_admin' && ' ⭐'}</p>
                                                )}
                                                <div className={`p-3 rounded-2xl ${isOwn ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'}`}>
                                                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 ml-1 text-xs text-gray-500">
                                                    <span>{formatTime(message.createdAt)}{message.isEdited && ' (edited)'}</span>
                                                    {isOwn && getMessageStatus(message)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">No messages yet</p>
                                        <p className="text-sm text-gray-400">Be the first to send a message!</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-0" />
                        </div>

                        {/* Message Input */}
                        <div ref={inputRef} className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="flex items-end gap-2">
                                <textarea value={messageInput} onChange={handleMessageInput} onKeyDown={handleKeyPress} placeholder={selectedRoom && !currentConversation ? `Message #${selectedRoom}...` : "Type a message..."} rows={1} className="flex-1 pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" style={{ minHeight: '44px', maxHeight: '120px' }} />
                                <button onClick={handleSendMessage} disabled={sending || !messageInput.trim()} className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                            {!isAtBottom && messages.length > 5 && (
                                <button onClick={scrollToBottom} className="absolute bottom-24 right-8 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-10">
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageCircle className="w-16 h-16 text-indigo-600 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Messages</h3>
                            <p className="text-gray-600 dark:text-gray-400">Select a room or start a private chat</p>
                        </div>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isGroupChat ? 'Create Group' : 'New Message'}</h3>
                            <button onClick={() => { setShowNewChatModal(false); resetNewChatForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <button onClick={() => setIsGroupChat(false)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isGroupChat ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Direct</button>
                                <button onClick={() => setIsGroupChat(true)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isGroupChat ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Group</button>
                            </div>
                            {isGroupChat && <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group name" className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" value={searchUsers} onChange={(e) => { const value = e.target.value; setSearchUsers(value); if (!value.trim()) { setUserSearchResults([]); if (searchTimeout.current) clearTimeout(searchTimeout.current); return; } if (searchTimeout.current) clearTimeout(searchTimeout.current); searchTimeout.current = setTimeout(() => searchForUsers(value), 500); }} placeholder="Search users..." className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map((user) => (
                                        <div key={user._id} className="flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-sm">
                                            <span>{user.username}</span>
                                            <button onClick={() => setSelectedUsers(prev => prev.filter(u => u._id !== user._id))}><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {searchUsers && (
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {searchingUsers ? (<div className="flex justify-center py-4"><Loader2 className="w-6 h-6 text-indigo-600 animate-spin" /></div>) : userSearchResults.length > 0 ? userSearchResults.map((result) => (
                                        <button key={result._id} onClick={() => { if (!isGroupChat) setSelectedUsers([result]); else if (!selectedUsers.some(u => u._id === result._id)) setSelectedUsers(prev => [...prev, result]); }} disabled={result._id === user?._id} className={`w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all ${result._id === user?._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {getAvatar({ userId: result, name: result.username, role: result.role })}
                                            <div className="flex-1 text-left"><p className="text-sm font-semibold">{result.username}</p><p className="text-xs text-gray-500">{result.email}</p></div>
                                            {getRoleBadge(result.role)}
                                        </button>
                                    )) : <p className="text-center text-gray-500 py-4">No users found</p>}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                            <button onClick={() => { setShowNewChatModal(false); resetNewChatForm(); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                            <button onClick={createNewConversation} disabled={selectedUsers.length === 0 || (isGroupChat && !groupName.trim())} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">Start Chat</button>
                        </div>
                    </div>
    </div>
            )}
        </div>
    );
}