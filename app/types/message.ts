export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    avatar?: string;
    lastSeen?: Date;
    isOnline?: boolean;
}

export interface Message {
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
    recipients?: string[];
    isPrivate: boolean;
    readBy: Array<{
        user: User;
        readAt: Date;
    }>;
    mentions?: User[];
    replyTo?: Message;
    isEdited: boolean;
    editedAt?: Date;
    isDeleted: boolean;
    reactions: Array<{
        user: User;
        emoji: string;
        createdAt: Date;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
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
    groupDescription?: string;
    groupAdmins?: string[];
    lastMessage?: Message;
    lastMessageContent?: string;
    lastMessageTime?: Date;
    lastMessageSender?: string;
    unreadCount: number;
    room: string;
    createdAt: string;
    updatedAt: string;
}

export interface MessageState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    loading: boolean;
    error: string | null;
    onlineUsers: string[];
    typingUsers: string[];
}