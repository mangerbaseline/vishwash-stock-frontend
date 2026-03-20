// components/ai/AIChat.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { aiAgent, ChatRecord, AIResponse } from '../../lib/ai/agent';

interface Message {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
    popular: boolean;
    features: Array<{
        name: string;
        included: boolean;
    }>;
}

interface AIChatProps {
    onClose?: () => void;
    fullScreen?: boolean;
    initialMessage?: string;
}

export default function AIChat({ onClose, fullScreen, initialMessage }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState(initialMessage || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [trialExpired, setTrialExpired] = useState(false);
    const [showPlansModal, setShowPlansModal] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const router = useRouter();

    // Check authentication and plan on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);

        if (!token) {
            setError('Please log in to use the AI assistant');
            return;
        }

        const checkStatus = async () => {
            try {
                const planData = await aiAgent.checkPlanStatus();
                if (planData.trialExpired || planData.isTrialExpired) {
                    setTrialExpired(true);
                    await fetchPlans();
                }
            } catch (e) {
                console.error('Initial status check fail:', e);
            }
        };

        checkStatus();
    }, []);

    const fetchPlans = async () => {
        setLoadingPlans(true);
        try {
            const response = await fetch('/api/subscription/plans');
            const data = await response.json();
            if (data.success && Array.isArray(data.plans)) {
                const formattedPlans = data.plans.map((plan: any) => ({
                    ...plan,
                    features: (plan.features || []).map((f: any) => 
                        typeof f === 'string' ? { name: f, included: true } : f
                    )
                }));
                setPlans(formattedPlans);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoadingPlans(false);
        }
    };

    const handleSendMessage = async (messageText?: string) => {
        const messageToSend = messageText || inputMessage;
        if (!messageToSend.trim() || loading || trialExpired) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please log in to use the AI assistant');
            return;
        }

        const userMessage: Message = {
            role: 'user',
            content: messageToSend
        };

        setMessages(prev => [...prev, userMessage]);
        if (!messageText) setInputMessage('');
        setLoading(true);
        setError(null);

        try {
            const result = await aiAgent.sendQuery(messageToSend);
            
            const assistantMessage: Message = {
                role: 'assistant',
                content: result.response
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error: any) {
            console.error('Error sending message:', error);

            if (error.requiresUpgrade || error.trialEnded) {
                setTrialExpired(true);
                await fetchPlans();
                setShowPlansModal(true);
                
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: error.message || 'Your trial has ended. Please upgrade.'
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                setError(error.message);
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: `Sorry, I encountered an error: ${error.message}. Please try again later.`
                };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Event handlers
    const handleSendButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        handleSendMessage();
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputMessage(suggestion);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleLoginClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        router.push('/signin');
    };

    const handleUpgradeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        router.push('/pricing');
    };

    const handleViewPlansClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        fetchPlans();
        setShowPlansModal(true);
    };

    const handleSelectPlan = (planId: string) => {
        closeModal();
        router.push(`/pricing/checkout?plan=${planId}`);
    };

    const closeModal = () => {
        setShowPlansModal(false);
    };

    const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        closeModal();
    };

    const handleModalContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">AI Stock Assistant</h2>
                    {trialExpired && (
                        <span className="px-2 py-1 text-xs bg-amber-500 text-white rounded-full font-medium animate-pulse">
                            Trial Expired
                        </span>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {!isAuthenticated ? (
                    /* Authentication Required View */
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m11-4v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h2a2 2 0 002-2V7a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 002 2h2a2 2 0 012 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Authentication Required
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                            Please log in to use the AI Stock Assistant.
                        </p>
                        <button
                            onClick={handleLoginClick}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                ) : trialExpired ? (
                    /* Trial Expired View */
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Your 3-Day Free Trial Has Ended
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                            Your 3-day free trial of TradeWise AI has expired. Please upgrade to a paid plan to continue using the AI assistant.
                        </p>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8 max-w-md">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Premium Features:</h4>
                            <ul className="space-y-3 text-left">
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Unlimited AI conversations</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Real-time stock data & analysis</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Technical indicators & charts</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Priority support</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleViewPlansClick}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md"
                            >
                                View Plans
                            </button>
                            <button
                                onClick={handleUpgradeClick}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                            >
                                Upgrade Now →
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                            Plans start at $29.99/month
                        </p>
                    </div>
                ) : messages.length === 0 ? (
                    /* Welcome View */
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Welcome to AI Stock Assistant!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                            Ask me anything about stocks, market analysis, or company information.
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                            {[
                                "What's $20MICRONS price?",
                                "Show me $RELIANCE",
                                "Top gainers today",
                                "Compare $TCS and $INFY"
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left text-gray-700 dark:text-gray-300"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Chat Messages */
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md rounded-bl-none border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
                {loading && !trialExpired && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {isAuthenticated ? (
                    !trialExpired ? (
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about stocks (e.g., What's $20MICRONS price?)"
                                disabled={loading}
                                className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <button
                                onClick={handleSendButtonClick}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <button
                                onClick={handleViewPlansClick}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all shadow-md"
                            >
                                Upgrade to Continue
                            </button>
                        </div>
                    )
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        Please log in to use the AI assistant
                    </div>
                )}
            </div>

            {/* Plans Modal */}
            {showPlansModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleModalBackdropClick}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={handleModalContentClick}>
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {loadingPlans ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {plans.filter(plan => plan.id !== 'free').map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={`relative rounded-2xl border ${plan.popular
                                                ? 'border-indigo-500 shadow-xl scale-105 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900'
                                                : 'border-gray-200 dark:border-gray-700'
                                                } p-6 flex flex-col h-full`}
                                        >
                                            {plan.popular && (
                                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                    Most Popular
                                                </span>
                                            )}

                                            <div className="mb-4">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                                        ${plan.price}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400">/{plan.interval}</span>
                                                </div>
                                            </div>

                                            <ul className="space-y-3 mb-6 flex-1">
                                                {plan.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center gap-2">
                                                        {feature.included ? (
                                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )}
                                                        <span className={`text-sm ${feature.included
                                                            ? 'text-gray-700 dark:text-gray-300'
                                                            : 'text-gray-400 dark:text-gray-600'
                                                            }`}>
                                                            {feature.name}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <button
                                                onClick={() => handleSelectPlan(plan.id)}
                                                className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${plan.popular
                                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                                                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                Select {plan.name}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}