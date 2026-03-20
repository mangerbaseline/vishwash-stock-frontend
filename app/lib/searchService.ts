// app/lib/searchService.ts
import { SearchResult, SearchResultType } from '../contexts/SearchContext';

class SearchService {
    private static instance: SearchService;
    // Fix 1: Change from SearchResultType[] to SearchResult[]
    private searchableData: SearchResult[] = [];
    private cryptoData: SearchResult[] = [];
    private initialized = false;

    private constructor() { }

    static getInstance(): SearchService {
        if (!SearchService.instance) {
            SearchService.instance = new SearchService();
        }
        return SearchService.instance;
    }

    async initialize(userRole: string = 'user') {
        if (this.initialized) return;

        // Fix 2: Define all searchable items with proper typing
        // You don't need 'as SearchResultType' for the type property anymore
        // since we're using SearchResult[] not SearchResultType[]
        this.searchableData = [
            // Dashboard Pages
            {
                id: 'dashboard-home',
                title: 'Dashboard Home',
                description: 'Main dashboard overview',
                type: 'dashboard',  // TypeScript will infer this correctly
                url: '/dashboard',
                icon: 'Home',
                category: 'navigation',
                tags: ['home', 'main', 'overview', 'dashboard']
            },
            {
                id: 'dashboard-stock',
                title: 'Stock Dashboard',
                description: 'Real-time stock market data',
                type: 'dashboard',
                url: '/dashboard/stock-dashboard',
                icon: 'Activity',
                category: 'finance',
                tags: ['stocks', 'market', 'trading', 'finance']
            },
            {
                id: 'dashboard-crypto',
                title: 'Cryptocurrency',
                description: 'Live crypto prices and charts',
                type: 'crypto',
                url: '/dashboard/crypto',
                icon: 'Zap',
                category: 'crypto',
                tags: ['bitcoin', 'ethereum', 'crypto', 'blockchain']
            },
            {
                id: 'dashboard-analytics',
                title: 'Analytics',
                description: 'Advanced analytics and reports',
                type: 'analytics',
                url: '/dashboard/analytics',
                icon: 'FileText',
                category: 'analytics',
                tags: ['analytics', 'reports', 'statistics', 'data']
            },
            {
                id: 'dashboard-settings',
                title: 'Settings',
                description: 'Account and application settings',
                type: 'setting',
                url: '/dashboard/settings',
                icon: 'Settings',
                category: 'settings',
                tags: ['settings', 'preferences', 'configuration']
            },

            // User Management (Admin only)
            // User Management (Admin only)
            ...(userRole === 'admin' ? ([
                {
                    id: 'admin-users',
                    title: 'User Management',
                    description: 'Manage all users',
                    type: 'admin',
                    url: '/dashboard/admin/users',
                    icon: 'Users',
                    category: 'admin',
                    tags: ['users', 'admin', 'management', 'permissions']
                },
                {
                    id: 'admin-roles',
                    title: 'Role Management',
                    description: 'Manage user roles and permissions',
                    type: 'admin',
                    url: '/dashboard/admin/roles',
                    icon: 'Settings',
                    category: 'admin',
                    tags: ['roles', 'permissions', 'access']
                },
                {
                    id: 'admin-audit',
                    title: 'Audit Logs',
                    description: 'System audit and activity logs',
                    type: 'admin',
                    url: '/dashboard/admin/audit',
                    icon: 'FileText',
                    category: 'admin',
                    tags: ['audit', 'logs', 'activity']
                }
            ] as SearchResult[]) : []),
            // Reports
            {
                id: 'report-weekly',
                title: 'Weekly Report',
                description: 'Weekly performance summary',
                type: 'report',
                url: '/dashboard/reports/weekly',
                icon: 'FileText',
                category: 'reports',
                tags: ['weekly', 'report', 'summary']
            },
            {
                id: 'report-monthly',
                title: 'Monthly Report',
                description: 'Monthly performance analysis',
                type: 'report',
                url: '/dashboard/reports/monthly',
                icon: 'FileText',
                category: 'reports',
                tags: ['monthly', 'report', 'analysis']
            },

            // Help & Support
            {
                id: 'help-guide',
                title: 'User Guide',
                description: 'Getting started guide',
                type: 'page',
                url: '/help/guide',
                icon: 'FileText',
                category: 'help',
                tags: ['help', 'guide', 'tutorial']
            },
            {
                id: 'help-faq',
                title: 'FAQ',
                description: 'Frequently asked questions',
                type: 'page',
                url: '/help/faq',
                icon: 'FileText',
                category: 'help',
                tags: ['faq', 'help', 'questions']
            },
            {
                id: 'help-contact',
                title: 'Contact Support',
                description: 'Get help from support team',
                type: 'page',
                url: '/help/contact',
                icon: 'Users',
                category: 'help',
                tags: ['support', 'contact', 'help']
            }
        ];

        this.initialized = true;
    }

    async fetchCryptoData() {
        try {
            // Fetch from CoinCap API
            const response = await fetch('https://api.coincap.io/v2/assets?limit=100');
            const data = await response.json();

            this.cryptoData = data.data.map((coin: any) => ({
                id: `crypto-${coin.id}`,
                title: `${coin.name} (${coin.symbol})`,
                description: `Price: $${parseFloat(coin.priceUsd).toFixed(2)} | Market Cap: $${parseFloat(coin.marketCapUsd).toFixed(0)}`,
                type: 'crypto',
                url: `/dashboard/crypto/${coin.id}`,
                icon: 'Zap',
                category: 'cryptocurrency',
                tags: ['crypto', coin.symbol.toLowerCase(), coin.name.toLowerCase(), 'bitcoin', 'ethereum'],
                metadata: {
                    price: coin.priceUsd,
                    symbol: coin.symbol,
                    change24h: coin.changePercent24Hr
                }
            }));
        } catch (error) {
            console.error('Error fetching crypto data:', error);
            this.cryptoData = [];
        }
    }

    async search(query: string, userRole: string = 'user'): Promise<SearchResult[]> {
        if (!query.trim()) return [];

        await this.initialize(userRole);
        await this.fetchCryptoData();

        const searchTerms = query.toLowerCase().split(' ');

        // Combine static data with crypto data
        const allData = [...this.searchableData, ...this.cryptoData];

        return allData
            .map(item => {
                // Calculate relevance score
                let score = 0;
                const searchableText = `${item.title} ${item.description} ${item.tags?.join(' ')} ${item.category}`.toLowerCase();

                // Exact matches get highest score
                if (searchableText.includes(query.toLowerCase())) {
                    score += 10;
                }

                // Individual term matches
                searchTerms.forEach(term => {
                    if (item.title.toLowerCase().includes(term)) score += 5;
                    if (item.description?.toLowerCase().includes(term)) score += 3;
                    if (item.tags?.some((tag: string) => tag.includes(term))) score += 2;
                    if (item.category?.toLowerCase().includes(term)) score += 1;
                });

                // Boost for crypto searches
                if (item.type === 'crypto' && searchTerms.some(term =>
                    ['btc', 'eth', 'crypto', 'bitcoin', 'ethereum'].includes(term)
                )) {
                    score += 8;
                }

                return { item, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .map(({ item }) => item)
            .slice(0, 20); // Limit to 20 results
    }

    async searchUsers(query: string, token: string): Promise<SearchResult[]> {
        // This would be an API call to your backend
        try {
            // Example: Fetch users from your API
            const response = await fetch(`/api/users/search?q=${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const users = await response.json();
            return users.map((user: any) => ({
                id: `user-${user._id}`,
                title: user.fullName || user.username,
                description: user.email,
                type: 'user',
                url: `/dashboard/admin/users/${user._id}`,
                icon: 'Users',
                category: 'users',
                tags: ['user', user.role, user.username],
                metadata: user
            }));
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    }
}

export const searchService = SearchService.getInstance();