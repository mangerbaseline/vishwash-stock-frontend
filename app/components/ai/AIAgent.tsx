import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { aiAgent, AIResponse, ChatRecord, MessageRecord } from '../../lib/ai/agent';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Minimize2, Maximize2, BrainCircuit, RefreshCw, History, Plus, Trash2, MessageSquare, Search, Sparkles, Crown, CheckCircle, Lock } from 'lucide-react';
import { useToast } from '../ui/toast';
import subscriptionService from '../../services/subscription';

interface Message {
    _id?: string;
    role: 'user' | 'assistant' | 'tool' | 'system';
    content: string;
    toolCalls?: any[];
    timestamp: Date;
}

interface AIAgentProps {
    isOpen?: boolean;
    onClose?: () => void;
    fullScreen?: boolean;
    initialMessage?: string;
    selectedStock?: string;
}

export default function AIAgent({
    isOpen = true,
    onClose,
    fullScreen = false,
    initialMessage,
    selectedStock
}: AIAgentProps) {
    const [query, setQuery] = useState(initialMessage || '');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [showTools, setShowTools] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(fullScreen);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<ChatRecord[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [historySearch, setHistorySearch] = useState('');
    const [availableTools, setAvailableTools] = useState<any[]>([]);
    const [trialExpired, setTrialExpired] = useState(false);
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Load available tools
    useEffect(() => {
        if (isOpen) {
            aiAgent.getAvailableTools().then(tools => {
                if (tools && tools.length > 0) setAvailableTools(tools);
            });
        }
    }, [isOpen]);

    // Filtered history based on search
    const filteredHistory = history.filter(chat =>
        (chat.title || 'Untitled Chat').toLowerCase().includes(historySearch.toLowerCase())
    );

    // Load history on mount
    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);



    const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
            const data = await subscriptionService.getPlans();
            if (data.success && Array.isArray(data.plans)) {
                // If the backend already returns the correct format (array of plans with feature objects)
                // we just need to adapt it slightly for the component's state if needed
                const formattedPlans = data.plans.map((plan: any) => ({
                    ...plan,
                    // If features are strings, convert to objects. If already objects, keep them.
                    features: (plan.features || []).map((f: any) => 
                        typeof f === 'string' ? { name: f, included: true } : f
                    ),
                    popular: plan.popular || plan.id === 'premium'
                }));
                setPlans(formattedPlans);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoadingPlans(false);
        }
    };







    // Check plan status on mount
    useEffect(() => {
        let isMounted = true;
        
        const performCheck = async () => {
            if (isOpen) {
                try {
                    const planData = await aiAgent.checkPlanStatus();
                    if (!isMounted) return;
                    console.log('Plan data from backend:', planData);

                    // Use backend's explicit flags for more reliability
                    if (planData.hasPaidPlan) {
                        setTrialExpired(false);
                    } else if (planData.trialExpired || planData.isTrialExpired) {
                        setTrialExpired(true);
                        await fetchPlans();
                    } else {
                        setTrialExpired(false);
                    }

                    // Update available tools based on plan
                    if (planData.features?.tools) {
                        // Ensure we handle both string names and full tool objects
                        const tools = planData.features.tools.map((t: any) => 
                            typeof t === 'string' ? t : t.name
                        );
                        setAvailableTools(tools);
                    }
                } catch (error) {
                    if (isMounted) {
                        console.error('Error checking plan:', error);
                    }
                }
            }
        };

        performCheck();
        
        return () => {
            isMounted = false;
        };
    }, [isOpen]);




    const checkPlanStatus = async () => {
        // This function is now just for manual refresh if needed
        const planData = await aiAgent.checkPlanStatus();
        return planData;
    };



    // const checkPlanStatus = async () => {
    //     try {
    //         const planData = await aiAgent.checkPlanStatus();

    //         // Check if trial expired
    //         if (planData.plan === 'free' && !planData.isTrial) {
    //             setTrialExpired(true);
    //             await fetchPlans();
    //         }

    //         // Update available tools based on plan
    //         if (planData.features?.tools) {
    //             setAvailableTools(planData.features.tools);
    //         }
    //     } catch (error) {
    //         console.error('Error checking plan:', error);
    //     }
    // };



    // const fetchPlans = async () => {
    //     setLoadingPlans(true);
    //     try {
    //         const response = await fetch('/api/subscription/plans');
    //         const data = await response.json();
    //         if (data.success) {
    //             setPlans(data.plans);
    //         }
    //     } catch (error) {
    //         console.error('Failed to fetch plans:', error);
    //     } finally {
    //         setLoadingPlans(false);
    //     }
    // };

    const loadHistory = async () => {
        const chats = await aiAgent.getHistory();
        setHistory(chats);
    };

    const loadChat = async (chatId: string) => {
        setLoading(true);
        try {
            const chatMessages = await aiAgent.getChatMessages(chatId);
            const formattedMessages = chatMessages.map(m => ({
                ...m,
                timestamp: new Date(m.timestamp)
            })) as Message[];

            setMessages(formattedMessages);
            setActiveChatId(chatId);
            aiAgent.currentConversationId = chatId;
            if (window.innerWidth < 768) setShowHistory(false);
        } catch (error) {
            addToast('Failed to load chat history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        setMessages([]);
        setActiveChatId(null);
        aiAgent.currentConversationId = null;
        setQuery('');
        if (window.innerWidth < 768) setShowHistory(false);
        addToast('Fresh session started', 'success');
    };

    const deleteChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (confirm('Delete this conversation?')) {
            await aiAgent.deleteChat(chatId);
            if (activeChatId === chatId) startNewChat();
            loadHistory();
        }
    };

    // Handle initial message if provided
    useEffect(() => {
        if (initialMessage && !loading) {
            setQuery(initialMessage);
        }
    }, [initialMessage]);






    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || loading) return;

        // If trial expired, show plans modal instead of trying to send
        if (trialExpired) {
            setShowPlansModal(true);
            return;
        }

        const userMessage: Message = {
            role: 'user',
            content: query,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentQuery = query;
        setQuery('');
        setLoading(true);

        try {
            const response = await aiAgent.sendQuery(currentQuery, activeChatId || undefined);

            const aiMessage: Message = {
                role: 'assistant',
                content: response.response,
                toolCalls: response.toolCalls,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);

            if (!activeChatId && response.conversationId) {
                setActiveChatId(response.conversationId);
                loadHistory();
            }

            // Update subscription info from response
            if (response.subscription) {
                if (response.subscription.plan === 'free' && !response.subscription.isTrial) {
                    setTrialExpired(true);
                    await fetchPlans();
                }

                // Show remaining queries for trial users
                if (response.subscription.queriesRemaining !== undefined) {
                    addToast(`${response.subscription.queriesRemaining} queries remaining today`, 'info');
                }
            }

        } catch (error: any) {
            // Check for trial expiration
            if (error.requiresUpgrade || error.trialEnded ||
                (error.message && (error.message.includes('Trial period expired') ||
                    error.message.includes('expired') ||
                    error.message.includes('upgrade')))) {
                setTrialExpired(true);
                await fetchPlans();
                setShowPlansModal(true);
            }
            addToast(error.message || 'Failed to get response from AI', 'error');
        } finally {
            setLoading(false);
        }
    };








    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!query.trim() || loading) return;

    //     const userMessage: Message = {
    //         role: 'user',
    //         content: query,
    //         timestamp: new Date()
    //     };

    //     setMessages(prev => [...prev, userMessage]);
    //     const currentQuery = query;
    //     setQuery('');
    //     setLoading(true);

    //     try {
    //         const response = await aiAgent.sendQuery(currentQuery, activeChatId || undefined);

    //         const aiMessage: Message = {
    //             role: 'assistant',
    //             content: response.response,
    //             toolCalls: response.toolCalls,
    //             timestamp: new Date()
    //         };

    //         setMessages(prev => [...prev, aiMessage]);

    //         if (!activeChatId && response.conversationId) {
    //             setActiveChatId(response.conversationId);
    //             loadHistory();
    //         }

    //     } catch (error: any) {
    //         // Check for trial expiration
    //         if (error.message && (error.message.includes('Trial period expired') || error.message.includes('expired'))) {
    //             setTrialExpired(true);
    //             await fetchPlans();
    //             setShowPlansModal(true);
    //         }
    //         addToast(error.message || 'Failed to get response from AI', 'error');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const clearConversation = async () => {
        if (activeChatId) {
            if (confirm('Clear messages in this chat?')) {
                startNewChat();
            }
        } else {
            setMessages([]);
            addToast('Memory cleared', 'info');
        }
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    if (!isOpen) return null;

    return (
        <div className={`flex bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ${isFullScreen ? 'fixed inset-4 z-[100]' : 'w-full h-full'
            }`}>

            {/* History Sidebar */}
            {showHistory && (
                <div className="w-72 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col animate-in slide-in-from-left duration-300">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <History className="w-4 h-4" /> Chats
                        </h3>
                        <Button variant="outline" size="sm" onClick={startNewChat} title="New Chat" className="h-8 w-8 p-0">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search history..."
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredHistory.length === 0 ? (
                            <div className="text-center py-10 px-4 text-sm text-gray-500 italic">
                                {historySearch ? 'No matches found.' : 'No previous chats.'}
                            </div>
                        ) : (
                            filteredHistory.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => loadChat(chat._id)}
                                    className={`group relative p-3 rounded-xl cursor-pointer transition-all ${activeChatId === chat._id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                        : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="w-4 h-4 mt-1 opacity-60" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-medium truncate">{chat.title || 'Untitled Chat'}</p>
                                            <p className="text-[10px] opacity-50 mt-1">
                                                {new Date(chat.lastActive).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => deleteChat(e, chat._id)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            <History className="w-5 h-5" />
                        </button>
                        <BrainCircuit className="w-6 h-6 animate-pulse" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold leading-none">TradeWise AI</h2>
                                {trialExpired && (
                                    <span className="px-1.5 py-0.5 text-[8px] bg-amber-500 text-white rounded-full font-bold uppercase tracking-wider animate-pulse">
                                        Trial Expired
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] opacity-75 mt-1">
                                {activeChatId ? 'Syncing history...' : 'New Session'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleFullScreen}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        {onClose && (
                            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-header tools */}
                <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowTools(!showTools)}
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                            {showTools ? 'Hide' : 'Show'} Intelligence Tools
                        </button>
                        <button
                            onClick={() => { fetchPlans(); setShowPlansModal(true); }}
                            className="text-xs font-medium text-amber-600 dark:text-amber-500 hover:underline flex items-center gap-1"
                        >
                            <Crown className="w-3 h-3" /> Upgrade
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={startNewChat}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> New Chat
                        </button>
                        <button
                            onClick={clearConversation}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:text-red-500"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {showTools && (
                    <div className="mx-6 mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-lg animate-in fade-in zoom-in-95 duration-200 z-10">
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-indigo-600 dark:text-indigo-400">Available Real-time Capabilities:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                            {(availableTools.length > 0 ? availableTools : ['getStockPrice', 'getStockHistory', 'compareStocks', 'getMarketNews', 'calculateRSI', 'calculateMovingAverage', 'getTopGainers', 'getTopLosers']).map(tool => (
                                <div key={typeof tool === 'string' ? tool : tool.name} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                    <code className="text-indigo-600 dark:text-indigo-400">{typeof tool === 'string' ? tool : tool.name}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900/50">
                    {trialExpired ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <Lock className="w-12 h-12 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                Intelligence Access Restricted
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                                Your 3-day free trial of TradeWise AI has expired. To continue receiving professional market analysis and technical verification, please upgrade to a paid plan.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                <Button
                                    onClick={() => setShowPlansModal(true)}
                                    className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg transform transition-all active:scale-95"
                                >
                                    View Premium Plans
                                </Button>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-lg opacity-50 grayscale pointer-events-none">
                                {["RSI Analysis", "Technical Smoothing", "Sentiment Analysis", "Portfolio Audit"].map(f => (
                                    <div key={f} className="p-3 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-2 bg-white/50 dark:bg-gray-800/50">
                                        <Lock className="w-3 h-3" />
                                        <span className="text-xs font-medium">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-indigo-500 opacity-20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                <BrainCircuit className="w-16 h-16 text-indigo-600 dark:text-indigo-400 relative z-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                TradeWise Intelligence
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
                                Professional stock analysis, market insights, and technical verification at your fingertips.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                                {[
                                    "Analyze $RELIANCE technicals",
                                    "Compare $TCS vs $INFY performance",
                                    "Top 5 gainers in Nifty 50 today",
                                    "Explain current market sentiment",
                                    "Calculate 14-day RSI for $AAPL",
                                    "Latest news on semiconductor stocks"
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setQuery(suggestion)}
                                        className="p-4 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all text-left text-gray-700 dark:text-gray-300 group"
                                    >
                                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">{suggestion}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-3xl p-5 ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200 dark:shadow-none shadow-lg'
                                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xl rounded-tl-none border border-gray-100 dark:border-gray-700'
                                            }`}
                                    >
                                        <div className={`prose prose-sm dark:prose-invert max-w-none ${msg.role === 'user' ? 'text-white' : ''}`}>
                                            {msg.role === 'assistant' ? (
                                                <ReactMarkdown>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>

                                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {msg.toolCalls.map((t, i) => (
                                                        <span key={i} className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-[9px] rounded border border-indigo-200 dark:border-indigo-700 font-mono text-indigo-500 inline-flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                            {t.name}()
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3 flex items-center justify-between opacity-40">
                                            <span className="text-[10px] font-bold uppercase">
                                                {msg.role === 'user' ? 'You' : 'Agent'}
                                            </span>
                                            <span className="text-[10px]">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                    {loading && (
                        <div className="flex justify-start max-w-4xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Brain Activity</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <form onSubmit={handleSubmit} className="flex gap-4 max-w-5xl mx-auto">
                        <div className="relative flex-1 group">
                            <Input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Command TradeWise AI..."
                                disabled={loading}
                                className="w-full text-base py-7 px-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 focus:border-indigo-500 dark:focus:border-indigo-500 bg-gray-50 dark:bg-gray-800/50 transition-all shadow-inner group-hover:bg-white dark:group-hover:bg-gray-800"
                            />
                            {trialExpired && (
                                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center cursor-not-allowed">
                                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                        <Lock className="w-3.5 h-3.5" /> Subscription Required
                                    </span>
                                </div>
                            )}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <span className={`px-2 py-1 text-[10px] font-bold rounded border ${loading ? 'animate-pulse bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    {loading ? 'BUSY' : 'READY'}
                                </span>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className={`h-[60px] px-10 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 transform active:scale-95 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : trialExpired
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-gradient-to-br from-indigo-600 to-purple-700 hover:shadow-indigo-200 dark:hover:shadow-none'
                                }`}
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : trialExpired ? 'UPGRADE' : 'EXECUTE'}
                        </Button>
                    </form>
                    <div className="mt-4 flex items-center justify-center gap-6 text-[11px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> Real-time Nodes Active</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><BrainCircuit className="w-3 h-3" /> Llama 3.3 Persistence</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-indigo-500">v2.0 Hybrid Architecture</span>
                    </div>
                </div>
            </div>

            {/* Plans Modal */}
            {showPlansModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowPlansModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                    <Crown className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Professional Intelligence Plans</h2>
                                    <p className="text-xs text-gray-500">Unlock the full power of TradeWise AI with real-time data</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPlansModal(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 dark:bg-gray-950/50">
                            {loadingPlans ? (
                                <div className="flex flex-col justify-center items-center py-20 gap-4">
                                    <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                                    <p className="text-sm font-medium text-gray-500">Fetching latest options...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {plans.filter(plan => plan.id !== 'free').map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={`relative rounded-3xl border-2 p-6 flex flex-col h-full transition-all duration-300 ${plan.popular
                                                ? 'border-indigo-500 shadow-xl bg-white dark:bg-gray-900 scale-[1.02]'
                                                : 'border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 hover:border-gray-300 dark:hover:border-gray-700'
                                                }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                                    Most Popular
                                                </div>
                                            )}

                                            <div className="mb-6">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-black text-gray-900 dark:text-white">
                                                        ₹{plan.price}
                                                    </span>
                                                    <span className="text-gray-500 text-sm font-medium">/{plan.interval || 'mo'}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-8 flex-1">
                                                {plan.features.map((feature: any, index: number) => (
                                                    <div key={index} className="flex items-start gap-3">
                                                        {feature.included ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                        ) : (
                                                            <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                                                        )}
                                                        <span className={`text-sm ${feature.included
                                                            ? 'text-gray-700 dark:text-gray-300'
                                                            : 'text-gray-400'
                                                            }`}>
                                                            {feature.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>



                                            <button
                                                onClick={() => {
                                                    // Close modal and redirect to pricing page with selected plan
                                                    setShowPlansModal(false);
                                                    // You can either redirect to a dedicated checkout page
                                                    window.location.href = `/pricing?selected=${plan.id}`;
                                                    // Or open a payment modal directly
                                                    // handleUpgrade(plan.id);
                                                }}
                                                className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${plan.popular
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transform hover:-translate-y-1'
                                                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                Select {plan.name} Plan
                                            </button>







                                            {/* <button
                                                onClick={() => window.location.href = `/pricing/checkout?plan=${plan.id}`}
                                                className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${plan.popular
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transform hover:-translate-y-1'
                                                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                Select {plan.name} Plan
                                            </button> */}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl flex items-center gap-4">
                                <Sparkles className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-amber-900 dark:text-amber-400 text-sm">Professional Verification Guarantee</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">All paid plans include access to real-time technical nodes, technical indicators (RSI, Moving Averages), and prioritized GPT-4o analysis for deep market insights.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-center text-[11px] text-gray-500 font-medium">
                            Secure payment processing via Stripe & Razorpay. Cancel anytime.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}