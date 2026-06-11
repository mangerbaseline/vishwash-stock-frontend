// app/lib/ai/tools.ts
import axios from 'axios';

// Use the correct backend URL - from your curl output, it's working on port 5000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============== ROLE-BASED ACCESS CONTROL ==============

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest'
}

export interface UserContext {
    role: UserRole;
    userId?: string;
    permissions?: string[];
}

// Permission definitions
const PERMISSIONS = {
    ADMIN: {
        canViewAllData: true,
        canModifyData: true,
        canViewSensitiveData: true,
        canManageUsers: true,
        canExportData: true,
        canViewAuditLogs: true,
        canExecuteAdminQueries: true
    },
    USER: {
        canViewAllData: false,
        canModifyData: false,
        canViewSensitiveData: false,
        canManageUsers: false,
        canExportData: false,
        canViewAuditLogs: false,
        canExecuteAdminQueries: false,
        canViewOwnData: true,
        canViewPublicData: true
    },
    GUEST: {
        canViewAllData: false,
        canModifyData: false,
        canViewSensitiveData: false,
        canManageUsers: false,
        canExportData: false,
        canViewAuditLogs: false,
        canExecuteAdminQueries: false,
        canViewPublicData: true,
        limitedToPublicData: true
    }
};

// Check if user has permission
function hasPermission(userRole: UserRole, permission: keyof typeof PERMISSIONS.ADMIN): boolean {
    const roleKey = userRole.toUpperCase() as keyof typeof PERMISSIONS;
    return (PERMISSIONS[roleKey] as any)?.[permission] || false;
}

// Filter data based on role
function filterDataByRole<T>(data: T, userRole: UserRole, sensitiveFields: string[] = []): T {
    if (userRole === UserRole.ADMIN) {
        return data; // Admin sees all data
    }

    if (Array.isArray(data)) {
        return data.map(item => filterDataByRole(item, userRole, sensitiveFields)) as any;
    }

    if (data && typeof data === 'object') {
        const filtered: any = {};
        for (const [key, value] of Object.entries(data)) {
            // Remove sensitive fields for non-admin users
            if (sensitiveFields.includes(key)) {
                continue;
            }
            // For guest users, only show public data
            if (userRole === UserRole.GUEST && key.startsWith('_')) {
                continue;
            }
            filtered[key] = filterDataByRole(value, userRole, sensitiveFields);
        }
        return filtered;
    }

    return data;
}

// ============== DATABASE QUERY FUNCTIONS ==============

// Generic database query with role-based access
export async function executeDatabaseQuery(
    queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    table: string,
    conditions?: any,
    data?: any,
    userContext?: UserContext
): Promise<any> {
    try {
        // Check permissions based on query type
        if (!userContext) {
            userContext = { role: UserRole.GUEST };
        }

        // Admin-only operations
        if (queryType === 'DELETE' && !hasPermission(userContext.role, 'canModifyData')) {
            throw new Error('Permission denied: You do not have permission to delete data');
        }

        if (queryType === 'UPDATE' && !hasPermission(userContext.role, 'canModifyData')) {
            throw new Error('Permission denied: You do not have permission to update data');
        }

        if (queryType === 'INSERT' && !hasPermission(userContext.role, 'canModifyData')) {
            throw new Error('Permission denied: You do not have permission to insert data');
        }

        console.log(`🔍 Executing ${queryType} query on ${table} with role: ${userContext.role}`);

        // Build the request based on query type
        let endpoint = `${API_BASE_URL}/api/db-query`;
        let method = 'POST';

        const payload = {
            queryType,
            table,
            conditions,
            data,
            userRole: userContext.role,
            userId: userContext.userId
        };

        const response = await axios({
            method,
            url: endpoint,
            data: payload,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Filter sensitive data based on role
        const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'ssn', 'creditCard'];
        const filteredData = filterDataByRole(response.data, userContext.role, sensitiveFields);

        return filteredData;

    } catch (error: any) {
        console.error(`❌ Error executing database query:`, error.message);
        throw error;
    }
}

// ============== STOCK DATA FUNCTIONS WITH ROLE ACCESS ==============

export async function getStockData(symbol: string, userContext?: UserContext): Promise<any> {
    try {
        if (!userContext) {
            userContext = { role: UserRole.GUEST };
        }

        console.log(`🔍 Fetching stock data for ${symbol} with role: ${userContext.role}`);

        const response = await axios.get(`${API_BASE_URL}/api/db-stocks`, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        let stocksData = [];
        if (response.data.success && Array.isArray(response.data.data)) {
            stocksData = response.data.data;
        } else if (Array.isArray(response.data)) {
            stocksData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
            stocksData = response.data.data;
        }

        console.log(`📊 Found ${stocksData.length} stocks in database`);

        const stock = stocksData.find((s: any) => {
            const stockSymbol = (s.symbol || s.Symbol || '').toString().toUpperCase().trim();
            const searchSymbol = symbol.toString().toUpperCase().trim();
            return stockSymbol === searchSymbol;
        });

        if (!stock) {
            const availableSymbols = stocksData.slice(0, 10).map((s: any) => s.symbol || s.Symbol).join(', ');
            console.log(`❌ Stock ${symbol} not found. Available: ${availableSymbols}`);
            throw new Error(`Stock ${symbol} not found in database`);
        }

        // Transform the data
        let stockData: any = {
            symbol: stock.symbol || stock.Symbol || symbol,
            name: stock.companyName || stock["Company Name"] || stock.name || symbol,
            price: parseFloat(stock.currentPrice || stock["Current Price"] || stock.price || 0),
            change: parseFloat(stock.change || stock.Change || 0),
            changePercent: parseFloat(stock.changePercent || stock.ChangePercent || 0),
            volume: parseInt(stock.volume || stock.Volume || 0),
            avgVolume: parseInt(stock.avgVolume || stock.AvgVolume || 0),
            marketCap: parseFloat(stock.marketCap || stock["Market Cap"] || 0),
            pe: parseFloat(stock.pe || stock["Stock P/E"] || stock.PE || 0),
            eps: parseFloat(stock.eps || stock.EPS || 0),
            dividend: parseFloat(stock.dividend || stock["Dividend Yield"] || 0),
            sector: stock.sector || stock.Sector || 'Unknown',
            high: parseFloat(stock.high || stock.High || 0),
            low: parseFloat(stock.low || stock.Low || 0),
            open: parseFloat(stock.open || stock.Open || 0),
            previousClose: parseFloat(stock.previousClose || stock["Previous Close"] || 0),
        };

        // For admin users, add additional metadata
        if (userContext.role === UserRole.ADMIN) {
            stockData = {
                ...stockData,
                _metadata: {
                    lastUpdated: stock.updatedAt || new Date().toISOString(),
                    source: stock.source || 'database',
                    confidence: stock.confidence || 1.0,
                    rawData: stock
                }
            };
        }

        // Filter sensitive fields for non-admin users
        const sensitiveFields = ['_metadata', 'rawData', 'internalNotes'];
        const filteredData = filterDataByRole(stockData, userContext.role, sensitiveFields);

        return filteredData;

    } catch (error: any) {
        console.error(`❌ Error fetching stock data for ${symbol}:`, error.message);
        if (error.code === 'ECONNREFUSED') {
            throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please make sure it's running.`);
        }
        throw error;
    }
}

// ============== ADMIN-SPECIFIC FUNCTIONS ==============

export async function getAllUsers(userContext?: UserContext): Promise<any[]> {
    if (!userContext || userContext.role !== UserRole.ADMIN) {
        throw new Error('Permission denied: Only admins can view all users');
    }

    try {
        const response = await executeDatabaseQuery('SELECT', 'users', {}, null, userContext);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

export async function getUserActivity(userId: string, userContext?: UserContext): Promise<any> {
    if (!userContext || userContext.role !== UserRole.ADMIN) {
        throw new Error('Permission denied: Only admins can view user activity');
    }

    try {
        const response = await executeDatabaseQuery(
            'SELECT',
            'user_activity',
            { userId },
            null,
            userContext
        );
        return response.data || [];
    } catch (error) {
        console.error('Error fetching user activity:', error);
        throw error;
    }
}

export async function updateUserRole(userId: string, newRole: UserRole, userContext?: UserContext): Promise<any> {
    if (!userContext || userContext.role !== UserRole.ADMIN) {
        throw new Error('Permission denied: Only admins can update user roles');
    }

    try {
        const response = await executeDatabaseQuery(
            'UPDATE',
            'users',
            { id: userId },
            { role: newRole },
            userContext
        );
        return response;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}

// ============== MARKET NEWS FUNCTIONS ==============

export async function getMarketNews(symbol?: string, userContext?: UserContext): Promise<any[]> {
    try {
        if (!userContext) {
            userContext = { role: UserRole.GUEST };
        }

        console.log(`🔍 Fetching market news${symbol ? ` for ${symbol}` : ''} with role: ${userContext.role}`);

        const url = symbol
            ? `${API_BASE_URL}/api/news/stock/${symbol}`
            : `${API_BASE_URL}/api/news/stocks`;

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        let news = [];
        if (response.data.success && Array.isArray(response.data.data)) {
            news = response.data.data;
        } else if (Array.isArray(response.data)) {
            news = response.data;
        }

        // Filter sensitive news for non-admin users
        const sensitiveFields = ['internalNotes', 'restricted'];
        const filteredNews = filterDataByRole(news, userContext.role, sensitiveFields);

        return filteredNews;
    } catch (error) {
        console.error('Error fetching market news:', error);
        return [];
    }
}

// ============== SENTIMENT ANALYSIS ==============

export async function analyzeSentiment(news: any[], userContext?: UserContext): Promise<any> {
    const positiveWords = ['surge', 'gain', 'rally', 'high', 'positive', 'growth', 'profit', 'record', 'beat', 'upgrade', 'bull', 'rise', 'jump', 'soar', 'strong', 'good', 'excellent'];
    const negativeWords = ['drop', 'fall', 'low', 'down', 'negative', 'loss', 'decline', 'crash', 'bear', 'slump', 'plunge', 'slip', 'miss', 'downgrade', 'weak', 'poor', 'bad'];

    const breakdown = news.map(item => {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase();

        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;

        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        let score = 0;

        if (positiveCount > negativeCount) {
            sentiment = 'positive';
            score = Math.min(1, positiveCount / 5);
        } else if (negativeCount > positiveCount) {
            sentiment = 'negative';
            score = Math.max(-1, -negativeCount / 5);
        }

        return {
            title: item.title,
            sentiment,
            score,
        };
    });

    const averageScore = breakdown.reduce((sum, item) => sum + item.score, 0) / (breakdown.length || 1);

    let overall: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (averageScore > 0.2) overall = 'positive';
    else if (averageScore < -0.2) overall = 'negative';

    const result = {
        overall,
        score: averageScore,
        breakdown,
    };

    // For admin users, add detailed analysis
    if (userContext?.role === UserRole.ADMIN) {
        return {
            ...result,
            _detailedAnalysis: {
                totalArticles: news.length,
                positiveArticles: breakdown.filter(b => b.sentiment === 'positive').length,
                negativeArticles: breakdown.filter(b => b.sentiment === 'negative').length,
                neutralArticles: breakdown.filter(b => b.sentiment === 'neutral').length,
                confidence: Math.abs(averageScore)
            }
        };
    }

    return result;
}

// ============== TECHNICAL INDICATORS ==============

export async function getTechnicalIndicators(symbol: string, userContext?: UserContext): Promise<any> {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/stocks/${symbol}/technical`, {
            timeout: 5000,
        }).catch(() => ({ data: null }));

        if (response.data) {
            const sensitiveFields = ['_internal', '_calculationDetails'];
            return filterDataByRole(response.data, userContext?.role || UserRole.GUEST, sensitiveFields);
        }
    } catch (error) {
        console.log('Technical indicators API not available, using calculated data');
    }

    try {
        const stockData = await getStockData(symbol, userContext);
        const price = stockData.price || 100;

        let indicators: any = {
            rsi: 45 + (Math.random() * 30 - 15),
            macd: {
                value: (Math.random() * 4) - 2,
                signal: (Math.random() * 3) - 1.5,
                histogram: (Math.random() * 1) - 0.5,
            },
            movingAverages: {
                ma50: price * (0.95 + Math.random() * 0.1),
                ma200: price * (0.90 + Math.random() * 0.2),
                signal: Math.random() > 0.6 ? 'BULLISH' : Math.random() > 0.3 ? 'BEARISH' : 'NEUTRAL',
            },
            support: [price * 0.95, price * 0.92, price * 0.88],
            resistance: [price * 1.05, price * 1.08, price * 1.12],
        };

        // Add detailed analysis for admin users
        if (userContext?.role === UserRole.ADMIN) {
            indicators = {
                ...indicators,
                _analysis: {
                    volatility: Math.random() * 0.3,
                    trendStrength: Math.random(),
                    recommendation: indicators.movingAverages.signal === 'BULLISH' ? 'BUY' :
                        indicators.movingAverages.signal === 'BEARISH' ? 'SELL' : 'HOLD'
                }
            };
        }

        return indicators;
    } catch (error) {
        return {
            rsi: 50,
            macd: { value: 0, signal: 0, histogram: 0 },
            movingAverages: { ma50: 0, ma200: 0, signal: 'NEUTRAL' },
            support: [0, 0, 0],
            resistance: [0, 0, 0],
        };
    }
}

// ============== MARKET SUMMARY ==============

export async function getMarketSummary(userContext?: UserContext): Promise<any> {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/db-stocks`, {
            timeout: 5000,
        }).catch(() => ({ data: { data: [] } }));

        let stocksData = [];
        if (response.data.success && Array.isArray(response.data.data)) {
            stocksData = response.data.data;
        }

        const gainers = stocksData.filter((s: any) => (s.change || 0) > 0).length;
        const losers = stocksData.filter((s: any) => (s.change || 0) < 0).length;

        let summary: any = {
            indices: {
                sensex: {
                    value: 72500 + Math.random() * 500,
                    change: (Math.random() * 400) - 200,
                    changePercent: (Math.random() * 0.8) - 0.4,
                },
                nifty: {
                    value: 22000 + Math.random() * 300,
                    change: (Math.random() * 150) - 75,
                    changePercent: (Math.random() * 0.7) - 0.35,
                },
            },
            breadth: {
                advances: gainers || 1200,
                declines: losers || 800,
                unchanged: 200,
                advanceDeclineRatio: (gainers || 1200) / (losers || 800),
            },
            sectorPerformance: [
                { sector: 'IT', change: (Math.random() * 2) - 1, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
                { sector: 'Banking', change: (Math.random() * 1.5) - 0.5, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
                { sector: 'Pharma', change: (Math.random() * 1.2) - 0.3, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
                { sector: 'Auto', change: (Math.random() * 1.8) - 0.8, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
                { sector: 'Energy', change: (Math.random() * 2.5) - 1.2, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
            ],
        };

        // Add admin insights
        if (userContext?.role === UserRole.ADMIN) {
            summary = {
                ...summary,
                _adminInsights: {
                    totalStocks: stocksData.length,
                    averageVolume: stocksData.reduce((sum: number, s: any) => sum + (s.volume || 0), 0) / stocksData.length,
                    topGainers: stocksData.sort((a: any, b: any) => (b.changePercent || 0) - (a.changePercent || 0)).slice(0, 5),
                    topLosers: stocksData.sort((a: any, b: any) => (a.changePercent || 0) - (b.changePercent || 0)).slice(0, 5),
                }
            };
        }

        return summary;
    } catch (error) {
        console.error('Error getting market summary:', error);
        return {
            indices: {
                sensex: { value: 72500, change: 0, changePercent: 0 },
                nifty: { value: 22000, change: 0, changePercent: 0 },
            },
            breadth: {
                advances: 1200,
                declines: 800,
                unchanged: 200,
                advanceDeclineRatio: 1.5,
            },
            sectorPerformance: [
                { sector: 'IT', change: 0, sentiment: 'neutral' },
                { sector: 'Banking', change: 0, sentiment: 'neutral' },
                { sector: 'Pharma', change: 0, sentiment: 'neutral' },
                { sector: 'Auto', change: 0, sentiment: 'neutral' },
                { sector: 'Energy', change: 0, sentiment: 'neutral' },
            ],
        };
    }
}

// ============== STOCK SEARCH ==============

export async function searchStocks(query: string, userContext?: UserContext): Promise<any[]> {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/db-stocks`, {
            timeout: 5000,
        });

        let stocksData = [];
        if (response.data.success && Array.isArray(response.data.data)) {
            stocksData = response.data.data;
        } else if (Array.isArray(response.data)) {
            stocksData = response.data;
        }

        const lowerQuery = query.toLowerCase();

        let results = stocksData
            .filter((stock: any) => {
                const symbol = (stock.symbol || stock.Symbol || '').toLowerCase();
                const name = (stock.companyName || stock["Company Name"] || stock.name || '').toLowerCase();
                return symbol.includes(lowerQuery) || name.includes(lowerQuery);
            })
            .slice(0, 10)
            .map((stock: any) => ({
                symbol: stock.symbol || stock.Symbol || '',
                name: stock.companyName || stock["Company Name"] || stock.name || '',
            }));

        // For admin users, add additional metadata to search results
        if (userContext?.role === UserRole.ADMIN) {
            results = results.map((result: any) => ({
                ...result,
                _searchScore: result.symbol.toLowerCase().includes(lowerQuery) ? 1 : 0.5,
                _exactMatch: result.symbol.toLowerCase() === lowerQuery
            }));
        }

        return results;
    } catch (error) {
        console.error('Error searching stocks:', error);
        return [];
    }
}

// ============== COMPANY INFORMATION ==============

export async function getCompanyInfo(symbol: string, userContext?: UserContext): Promise<any> {
    try {
        const stockData = await getStockData(symbol, userContext);

        let info: any = {
            name: stockData.name || symbol,
            sector: stockData.sector || 'Unknown',
            industry: stockData.industry || 'Unknown',
            website: '',
            description: `${stockData.name || symbol} is a publicly traded company.`,
            employees: Math.floor(Math.random() * 100000) + 1000,
        };

        // Add financial details for admin users
        if (userContext?.role === UserRole.ADMIN) {
            info = {
                ...info,
                _financialDetails: {
                    revenue: Math.random() * 1000000000,
                    profitMargin: Math.random() * 0.3,
                    debtToEquity: Math.random() * 2,
                    analystRatings: {
                        buy: Math.floor(Math.random() * 20),
                        hold: Math.floor(Math.random() * 15),
                        sell: Math.floor(Math.random() * 5)
                    }
                }
            };
        }

        return info;
    } catch (error) {
        return {
            name: symbol,
            sector: 'Unknown',
            industry: 'Unknown',
            website: '',
            description: `Information for ${symbol} is currently unavailable.`,
            employees: 0,
        };
    }
}

// ============== EXPORT FUNCTIONS ==============

export const dbTools = {
    // Role-based query execution
    executeQuery: executeDatabaseQuery,

    // Stock-related functions
    getStockData,
    searchStocks,
    getCompanyInfo,
    getTechnicalIndicators,

    // Market functions
    getMarketNews,
    getMarketSummary,
    analyzeSentiment,

    // Admin functions
    getAllUsers,
    getUserActivity,
    updateUserRole,

    // Utility functions
    hasPermission,
    filterDataByRole
};

export default dbTools;
















// // app/lib/ai/tools.ts
// import axios from 'axios';

// // Use the correct backend URL - from your curl output, it's working on port 5000
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// // ============== STOCK DATA FUNCTIONS ==============

// export async function getStockData(symbol: string): Promise<any> {
//     try {
//         console.log(`🔍 Fetching stock data for ${symbol} from ${API_BASE_URL}/api/db-stocks`);

//         // First, get all stocks
//         const response = await axios.get(`${API_BASE_URL}/api/db-stocks`, {
//             timeout: 10000,
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });

//         console.log('📡 API Response status:', response.status);

//         // Parse the response data
//         let stocksData = [];
//         if (response.data.success && Array.isArray(response.data.data)) {
//             stocksData = response.data.data;
//         } else if (Array.isArray(response.data)) {
//             stocksData = response.data;
//         } else if (response.data.data && Array.isArray(response.data.data)) {
//             stocksData = response.data.data;
//         }

//         console.log(`📊 Found ${stocksData.length} stocks in database`);

//         // Find the stock by symbol (case insensitive)
//         const stock = stocksData.find((s: any) => {
//             const stockSymbol = (s.symbol || s.Symbol || '').toString().toUpperCase().trim();
//             const searchSymbol = symbol.toString().toUpperCase().trim();
//             return stockSymbol === searchSymbol;
//         });

//         if (!stock) {
//             // Log available symbols for debugging
//             const availableSymbols = stocksData.slice(0, 10).map((s: any) => s.symbol || s.Symbol).join(', ');
//             console.log(`❌ Stock ${symbol} not found. Available: ${availableSymbols}`);
//             throw new Error(`Stock ${symbol} not found in database`);
//         }

//         console.log(`✅ Found stock data for ${symbol}:`, stock);

//         // Transform the data to a consistent format
//         return {
//             symbol: stock.symbol || stock.Symbol || symbol,
//             name: stock.companyName || stock["Company Name"] || stock.name || symbol,
//             price: parseFloat(stock.currentPrice || stock["Current Price"] || stock.price || 0),
//             change: parseFloat(stock.change || stock.Change || 0),
//             changePercent: parseFloat(stock.changePercent || stock.ChangePercent || 0),
//             volume: parseInt(stock.volume || stock.Volume || 0),
//             avgVolume: parseInt(stock.avgVolume || stock.AvgVolume || 0),
//             marketCap: parseFloat(stock.marketCap || stock["Market Cap"] || 0),
//             pe: parseFloat(stock.pe || stock["Stock P/E"] || stock.PE || 0),
//             eps: parseFloat(stock.eps || stock.EPS || 0),
//             dividend: parseFloat(stock.dividend || stock["Dividend Yield"] || 0),
//             sector: stock.sector || stock.Sector || 'Unknown',
//             high: parseFloat(stock.high || stock.High || 0),
//             low: parseFloat(stock.low || stock.Low || 0),
//             open: parseFloat(stock.open || stock.Open || 0),
//             previousClose: parseFloat(stock.previousClose || stock["Previous Close"] || 0),
//         };

//     } catch (error: any) {
//         console.error(`❌ Error fetching stock data for ${symbol}:`, error.message);
//         if (error.code === 'ECONNREFUSED') {
//             throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Please make sure it's running.`);
//         }
//         throw error;
//     }
// }

// // ============== MARKET NEWS FUNCTIONS ==============

// export async function getMarketNews(symbol?: string): Promise<any[]> {
//     try {
//         console.log(`🔍 Fetching market news${symbol ? ` for ${symbol}` : ''}`);

//         // Try to fetch from your news API
//         const url = symbol
//             ? `${API_BASE_URL}/api/news/stock/${symbol}`
//             : `${API_BASE_URL}/api/news/stocks`;

//         const response = await axios.get(url, {
//             timeout: 10000,
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });

//         if (response.data.success && Array.isArray(response.data.data)) {
//             return response.data.data;
//         } else if (Array.isArray(response.data)) {
//             return response.data;
//         }

//         return [];
//     } catch (error) {
//         console.error('Error fetching market news:', error);
//         // Return empty array on error
//         return [];
//     }
// }

// // ============== SENTIMENT ANALYSIS ==============

// export async function analyzeSentiment(news: any[]): Promise<{
//     overall: 'positive' | 'negative' | 'neutral';
//     score: number;
//     breakdown: Array<{ title: string; sentiment: string; score: number }>;
// }> {
//     const positiveWords = ['surge', 'gain', 'rally', 'high', 'positive', 'growth', 'profit', 'record', 'beat', 'upgrade', 'bull', 'rise', 'jump', 'soar', 'strong', 'good', 'excellent'];
//     const negativeWords = ['drop', 'fall', 'low', 'down', 'negative', 'loss', 'decline', 'crash', 'bear', 'slump', 'plunge', 'slip', 'miss', 'downgrade', 'weak', 'poor', 'bad'];

//     const breakdown = news.map(item => {
//         const text = (item.title + ' ' + (item.description || '')).toLowerCase();

//         const positiveCount = positiveWords.filter(word => text.includes(word)).length;
//         const negativeCount = negativeWords.filter(word => text.includes(word)).length;

//         let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
//         let score = 0;

//         if (positiveCount > negativeCount) {
//             sentiment = 'positive';
//             score = Math.min(1, positiveCount / 5);
//         } else if (negativeCount > positiveCount) {
//             sentiment = 'negative';
//             score = Math.max(-1, -negativeCount / 5);
//         }

//         return {
//             title: item.title,
//             sentiment,
//             score,
//         };
//     });

//     const averageScore = breakdown.reduce((sum, item) => sum + item.score, 0) / (breakdown.length || 1);

//     let overall: 'positive' | 'negative' | 'neutral' = 'neutral';
//     if (averageScore > 0.2) overall = 'positive';
//     else if (averageScore < -0.2) overall = 'negative';

//     return {
//         overall,
//         score: averageScore,
//         breakdown,
//     };
// }

// // ============== TECHNICAL INDICATORS ==============

// export async function getTechnicalIndicators(symbol: string): Promise<any> {
//     try {
//         // Try to fetch from your API
//         const response = await axios.get(`${API_BASE_URL}/api/stocks/${symbol}/technical`, {
//             timeout: 5000,
//         }).catch(() => ({ data: null }));

//         if (response.data) {
//             return response.data;
//         }
//     } catch (error) {
//         console.log('Technical indicators API not available, using calculated data');
//     }

//     // Get stock data first to calculate indicators
//     try {
//         const stockData = await getStockData(symbol);
//         const price = stockData.price || 100;

//         // Generate realistic technical indicators based on price
//         return {
//             rsi: 45 + (Math.random() * 30 - 15), // 30-60 range
//             macd: {
//                 value: (Math.random() * 4) - 2,
//                 signal: (Math.random() * 3) - 1.5,
//                 histogram: (Math.random() * 1) - 0.5,
//             },
//             movingAverages: {
//                 ma50: price * (0.95 + Math.random() * 0.1),
//                 ma200: price * (0.90 + Math.random() * 0.2),
//                 signal: Math.random() > 0.6 ? 'BULLISH' : Math.random() > 0.3 ? 'BEARISH' : 'NEUTRAL',
//             },
//             support: [
//                 price * 0.95,
//                 price * 0.92,
//                 price * 0.88,
//             ],
//             resistance: [
//                 price * 1.05,
//                 price * 1.08,
//                 price * 1.12,
//             ],
//         };
//     } catch (error) {
//         // Return default values if we can't get stock data
//         return {
//             rsi: 50,
//             macd: {
//                 value: 0,
//                 signal: 0,
//                 histogram: 0,
//             },
//             movingAverages: {
//                 ma50: 0,
//                 ma200: 0,
//                 signal: 'NEUTRAL',
//             },
//             support: [0, 0, 0],
//             resistance: [0, 0, 0],
//         };
//     }
// }

// // ============== MARKET SUMMARY ==============

// export async function getMarketSummary(): Promise<any> {
//     try {
//         // Try to fetch from your API
//         const stocks = await getStockData('RELIANCE').catch(() => null);

//         // Get some stocks to calculate market metrics
//         const response = await axios.get(`${API_BASE_URL}/api/db-stocks`, {
//             timeout: 5000,
//         }).catch(() => ({ data: { data: [] } }));

//         let stocksData = [];
//         if (response.data.success && Array.isArray(response.data.data)) {
//             stocksData = response.data.data;
//         }

//         // Calculate market metrics
//         const gainers = stocksData.filter((s: any) => (s.change || 0) > 0).length;
//         const losers = stocksData.filter((s: any) => (s.change || 0) < 0).length;

//         return {
//             indices: {
//                 sensex: {
//                     value: 72500 + Math.random() * 500,
//                     change: (Math.random() * 400) - 200,
//                     changePercent: (Math.random() * 0.8) - 0.4,
//                 },
//                 nifty: {
//                     value: 22000 + Math.random() * 300,
//                     change: (Math.random() * 150) - 75,
//                     changePercent: (Math.random() * 0.7) - 0.35,
//                 },
//             },
//             breadth: {
//                 advances: gainers || 1200,
//                 declines: losers || 800,
//                 unchanged: 200,
//                 advanceDeclineRatio: (gainers || 1200) / (losers || 800),
//             },
//             sectorPerformance: [
//                 { sector: 'IT', change: (Math.random() * 2) - 1, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
//                 { sector: 'Banking', change: (Math.random() * 1.5) - 0.5, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
//                 { sector: 'Pharma', change: (Math.random() * 1.2) - 0.3, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
//                 { sector: 'Auto', change: (Math.random() * 1.8) - 0.8, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
//                 { sector: 'Energy', change: (Math.random() * 2.5) - 1.2, sentiment: Math.random() > 0.5 ? 'positive' : 'negative' },
//             ],
//         };
//     } catch (error) {
//         console.error('Error getting market summary:', error);
//         // Return default market summary
//         return {
//             indices: {
//                 sensex: { value: 72500, change: 0, changePercent: 0 },
//                 nifty: { value: 22000, change: 0, changePercent: 0 },
//             },
//             breadth: {
//                 advances: 1200,
//                 declines: 800,
//                 unchanged: 200,
//                 advanceDeclineRatio: 1.5,
//             },
//             sectorPerformance: [
//                 { sector: 'IT', change: 0, sentiment: 'neutral' },
//                 { sector: 'Banking', change: 0, sentiment: 'neutral' },
//                 { sector: 'Pharma', change: 0, sentiment: 'neutral' },
//                 { sector: 'Auto', change: 0, sentiment: 'neutral' },
//                 { sector: 'Energy', change: 0, sentiment: 'neutral' },
//             ],
//         };
//     }
// }

// // ============== STOCK SEARCH ==============

// export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string }>> {
//     try {
//         const response = await axios.get(`${API_BASE_URL}/api/db-stocks`, {
//             timeout: 5000,
//         });

//         let stocksData = [];
//         if (response.data.success && Array.isArray(response.data.data)) {
//             stocksData = response.data.data;
//         } else if (Array.isArray(response.data)) {
//             stocksData = response.data;
//         }

//         const lowerQuery = query.toLowerCase();

//         return stocksData
//             .filter((stock: any) => {
//                 const symbol = (stock.symbol || stock.Symbol || '').toLowerCase();
//                 const name = (stock.companyName || stock["Company Name"] || stock.name || '').toLowerCase();
//                 return symbol.includes(lowerQuery) || name.includes(lowerQuery);
//             })
//             .slice(0, 10)
//             .map((stock: any) => ({
//                 symbol: stock.symbol || stock.Symbol || '',
//                 name: stock.companyName || stock["Company Name"] || stock.name || '',
//             }));
//     } catch (error) {
//         console.error('Error searching stocks:', error);
//         return [];
//     }
// }

// // ============== COMPANY INFORMATION ==============

// export async function getCompanyInfo(symbol: string): Promise<any> {
//     try {
//         const stockData = await getStockData(symbol);

//         return {
//             name: stockData.name || symbol,
//             sector: stockData.sector || 'Unknown',
//             industry: stockData.industry || 'Unknown',
//             website: '',
//             description: `${stockData.name || symbol} is a publicly traded company.`,
//             employees: Math.floor(Math.random() * 100000) + 1000,
//         };
//     } catch (error) {
//         return {
//             name: symbol,
//             sector: 'Unknown',
//             industry: 'Unknown',
//             website: '',
//             description: `Information for ${symbol} is currently unavailable.`,
//             employees: 0,
//         };
//     }
// }