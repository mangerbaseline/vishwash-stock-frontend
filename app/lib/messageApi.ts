const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface SendMessageData {
    content: string;
    room?: string;
    recipients?: string[];
    messageType?: 'text' | 'image' | 'file' | 'system';
    replyTo?: string;
    attachments?: Array<{
        url: string;
        filename: string;
        filetype: string;
        size: number;
    }>;
}

export const messageApi = {
    // Get conversations for user
    getConversations: async () => {
        console.log('📨 Fetching conversations...');

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token');
        }

        try {
            const response = await fetch(`${API_URL}/api/messages/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Error fetching conversations:', error);
            throw error;
        }
    },

    // Get messages for a conversation
    getMessages: async (conversationId: string) => {
        console.log('📨 Fetching messages for conversation:', conversationId);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/messages?conversationId=${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Error fetching messages:', error);
            throw error;
        }
    },

    // Send a message
    sendMessage: async (data: SendMessageData) => {
        console.log('📨 Sending message:', data);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: data.content,
                    room: data.room || 'general',
                    recipients: data.recipients || [],
                    messageType: data.messageType || 'text',
                    replyTo: data.replyTo,
                    attachments: data.attachments || []
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Send message error:', errorText);
                throw new Error(`Failed to send message: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Message sent:', result);
            return result;
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    },

    // Create new conversation
    createConversation: async (participants: string[], isGroup: boolean = false, groupName?: string) => {
        console.log('📨 Creating conversation:', { participants, isGroup, groupName });

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/messages/conversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participants,
                    isGroup,
                    groupName
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create conversation');
            }

            const result = await response.json();
            console.log('✅ Conversation created:', result);
            return result;
        } catch (error) {
            console.error('❌ Error creating conversation:', error);
            throw error;
        }
    },

    // Mark messages as read
    markAsRead: async (conversationId: string) => {
        console.log('📨 Marking as read:', conversationId);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/messages/conversations/${conversationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark as read');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error marking as read:', error);
            throw error;
        }
    },

    // Add reaction to message
    addReaction: async (messageId: string, emoji: string) => {
        console.log('📨 Adding reaction:', { messageId, emoji });

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ emoji })
            });

            if (!response.ok) {
                throw new Error('Failed to add reaction');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error adding reaction:', error);
            throw error;
        }
    },

    // Delete message
    deleteMessage: async (messageId: string) => {
        console.log('📨 Deleting message:', messageId);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete message');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('❌ Error deleting message:', error);
            throw error;
        }
    }
};