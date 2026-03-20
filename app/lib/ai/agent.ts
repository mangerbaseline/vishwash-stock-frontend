// frontend/lib/ai/agent.ts
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

export interface ChatRecord {
    _id: string;
    title: string;
    lastActive: string;
    createdAt: string;
}

export interface MessageRecord {
    _id?: string;
    role: 'user' | 'assistant' | 'tool' | 'system';
    content: string;
    toolCalls?: any[];
    timestamp: string;
}

export interface AIResponse {
    response: string;
    toolCalls?: any[];
    conversationId?: string;
    subscription?: {
        plan: string;
        isTrial: boolean;
        queriesRemaining?: number;
        trialEnds?: Date;
    };
}

export class AIAgent {
    private manualToken: string | null = null;

    constructor(conversationId?: string, token?: string) {
        if (conversationId) {
            this.currentConversationId = conversationId;
        }
        if (token) {
            this.manualToken = token;
        }
    }
    currentConversationId: string | null = null;

    private getToken() {
        if (this.manualToken) return this.manualToken;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    async sendQuery(query: string, conversationId?: string): Promise<AIResponse> {
        try {
            const token = this.getToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/ai-agent/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query,
                    conversationId: conversationId || this.currentConversationId
                })
            });

            // Handle potential non-JSON responses
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                // Check if it's a subscription error
                if (data.requiresUpgrade || data.trialEnded || response.status === 403) {
                    const error = new Error(data.message || 'Trial period expired');
                    (error as any).requiresUpgrade = true;
                    (error as any).trialEnded = data.trialEnded !== undefined ? data.trialEnded : true;
                    throw error;
                }
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            // Update current conversation ID if new one was created
            if (data.conversationId) {
                this.currentConversationId = data.conversationId;
            }

            return {
                response: data.response,
                toolCalls: data.toolCalls,
                conversationId: data.conversationId,
                subscription: data.subscription
            };
        } catch (error) {
            console.error('AI query error:', error);
            throw error;
        }
    }

    async processMessage(query: string, conversationId?: string): Promise<string> {
        try {
            const response = await this.sendQuery(query, conversationId);
            return response.response;
        } catch (error) {
            console.error('Process message error:', error);
            throw error;
        }
    }

    async getHistory(): Promise<ChatRecord[]> {
        try {
            const token = this.getToken();
            if (!token) return [];

            const response = await fetch(`${API_URL}/ai-agent/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch history');
            }

            return data.chats || [];
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    }

    async getChatMessages(chatId: string): Promise<MessageRecord[]> {
        try {
            const token = this.getToken();
            if (!token) return [];

            const response = await fetch(`${API_URL}/ai-agent/conversations/${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch messages');
            }

            return data.messages || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    async deleteChat(chatId: string): Promise<void> {
        try {
            const token = this.getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/ai-agent/conversations/${chatId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete chat');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    }

    async getAvailableTools(): Promise<any[]> {
        try {
            const token = this.getToken();
            if (!token) return [];

            const response = await fetch(`${API_URL}/ai-agent/tools`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                return [];
            }

            return data.tools || [];
        } catch (error) {
            console.error('Error fetching tools:', error);
            return [];
        }
    }

    async checkPlanStatus(): Promise<any> {
        try {
            const token = this.getToken();
            if (!token) {
                return {
                    success: false,
                    plan: 'free',
                    isTrial: false,
                    hasPaidPlan: false,
                    trialExpired: true
                };
            }

            const response = await fetch(`${API_URL}/ai-agent/plan-details`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error(`Plan check failed (HTTP ${response.status}):`, data);
                return {
                    success: false,
                    plan: 'free',
                    isTrial: false,
                    hasPaidPlan: false,
                    trialExpired: true
                };
            }

            return data;
        } catch (error: any) {
            // Handle abortion errors specifically if needed
            if (error.name === 'AbortError') {
                console.log('Plan status check aborted');
            } else {
                console.error('Error checking plan:', error);
            }
            return {
                success: false,
                plan: 'free',
                isTrial: false,
                hasPaidPlan: false,
                trialExpired: true
            };
        }
    }

    clearHistory(userId: string) {
        this.currentConversationId = null;
    }
}

export const aiAgent = new AIAgent();