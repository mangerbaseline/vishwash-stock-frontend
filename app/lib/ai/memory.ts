// app/lib/ai/memory.ts
interface ConversationEntry {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Conversation {
    id: string;
    userId: string;
    entries: ConversationEntry[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: {
        summary?: string;
        topics?: string[];
        favorite?: boolean;
    };
}

interface UserConversationInfo {
    id: string;
    summary: string;
    updatedAt: Date;
}

export class AIMemory {
    private conversations: Map<string, Conversation> = new Map();
    private userConversations: Map<string, Set<string>> = new Map();

    async addToConversation(conversationId: string, entry: Omit<ConversationEntry, 'timestamp'>, userId?: string) {
        if (!this.conversations.has(conversationId)) {
            this.conversations.set(conversationId, {
                id: conversationId,
                userId: userId || 'anonymous',
                entries: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            if (userId) {
                if (!this.userConversations.has(userId)) {
                    this.userConversations.set(userId, new Set());
                }
                this.userConversations.get(userId)!.add(conversationId);
            }
        }

        const conversation = this.conversations.get(conversationId)!;
        conversation.entries.push({
            ...entry,
            timestamp: new Date(),
        });
        conversation.updatedAt = new Date();

        // Keep only last 20 messages for performance
        if (conversation.entries.length > 20) {
            conversation.entries = conversation.entries.slice(-20);
        }

        // Generate summary every 10 messages
        if (conversation.entries.length % 10 === 0) {
            await this.generateSummary(conversationId);
        }
    }

    async getContext(conversationId: string): Promise<string> {
        const conversation = this.conversations.get(conversationId);

        if (!conversation || conversation.entries.length === 0) {
            return 'No previous conversation.';
        }

        const lastEntries = conversation.entries.slice(-5);

        let context = 'Previous conversation:\n';
        for (const entry of lastEntries) {
            const role = entry.role === 'user' ? 'User' : 'Assistant';
            context += `${role}: ${entry.content}\n`;
        }

        if (conversation.metadata?.summary) {
            context += `\nConversation summary: ${conversation.metadata.summary}\n`;
        }

        return context;
    }

    async getUserConversations(userId: string): Promise<UserConversationInfo[]> {
        const conversationIds = this.userConversations.get(userId);
        if (!conversationIds) return [];

        const conversations: UserConversationInfo[] = [];

        for (const id of conversationIds) {
            const conv = this.conversations.get(id);
            if (conv) {
                conversations.push({
                    id: conv.id,
                    summary: conv.metadata?.summary || 'Conversation',
                    updatedAt: conv.updatedAt,
                });
            }
        }

        // Sort by updatedAt, newest first
        return conversations.sort((a, b) => {
            return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
    }

    async clearConversation(conversationId: string) {
        const conversation = this.conversations.get(conversationId);
        if (conversation?.userId) {
            const userConvs = this.userConversations.get(conversation.userId);
            if (userConvs) {
                userConvs.delete(conversationId);
            }
        }
        this.conversations.delete(conversationId);
    }

    async clearAllUserConversations(userId: string) {
        const conversationIds = this.userConversations.get(userId);
        if (conversationIds) {
            for (const id of conversationIds) {
                this.conversations.delete(id);
            }
            this.userConversations.delete(userId);
        }
    }

    async getConversation(conversationId: string): Promise<Conversation | undefined> {
        return this.conversations.get(conversationId);
    }

    async getAllUserConversations(userId: string): Promise<Conversation[]> {
        const conversationIds = this.userConversations.get(userId);
        if (!conversationIds) return [];

        const conversations: Conversation[] = [];
        for (const id of conversationIds) {
            const conv = this.conversations.get(id);
            if (conv) {
                conversations.push(conv);
            }
        }

        return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    private async generateSummary(conversationId: string) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation || conversation.entries.length < 5) return;

        // Simple summary generation (can be enhanced with AI)
        const topics = new Set<string>();
        const keywords = ['stock', 'market', 'buy', 'sell', 'analysis', 'price', 'sector'];

        for (const entry of conversation.entries) {
            const content = entry.content.toLowerCase();
            for (const keyword of keywords) {
                if (content.includes(keyword)) {
                    topics.add(keyword);
                }
            }
        }

        conversation.metadata = {
            ...conversation.metadata,
            summary: `Conversation about ${Array.from(topics).slice(0, 3).join(', ')}`,
            topics: Array.from(topics),
        };
    }
}