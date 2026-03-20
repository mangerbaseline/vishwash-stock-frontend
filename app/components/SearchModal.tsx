'use client';

import React, { useEffect, useRef } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { searchService } from '../lib/searchService';
import { 
    Search, X, Clock, Terminal, FileText, 
    Zap, Home, Settings, Users, Activity,
    TrendingUp, ArrowRight, ChevronRight,
    Command, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function SearchModal() {
    const router = useRouter();
    const { 
        searchQuery, setSearchQuery, 
        searchResults, setSearchResults,
        isSearching, setIsSearching,
        recentSearches, addToRecentSearches,
        showSearchModal, setShowSearchModal,
        selectedResultIndex, setSelectedResultIndex,
        addToSearchHistory
    } = useSearch();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (showSearchModal && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showSearchModal]);

    useEffect(() => {
        const handleSearch = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchService.search(searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(handleSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, setIsSearching, setSearchResults]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') setShowSearchModal(false);
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedResultIndex((prev: number) => (prev < searchResults.length - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedResultIndex((prev: number) => (prev > 0 ? prev - 1 : 0));
        }
        if (e.key === 'Enter' && selectedResultIndex >= 0) {
            handleResultClick(searchResults[selectedResultIndex]);
        }
    };

    const handleResultClick = (result: any) => {
        addToRecentSearches(searchQuery);
        addToSearchHistory(result);
        setShowSearchModal(false);
        setSearchQuery('');
        router.push(result.url);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'dashboard': return <Home className="w-4 h-4" />;
            case 'crypto': return <Zap className="w-4 h-4 text-yellow-500" />;
            case 'analytics': return <Activity className="w-4 h-4 text-indigo-500" />;
            case 'user': return <Users className="w-4 h-4" />;
            case 'setting': return <Settings className="w-4 h-4" />;
            case 'report': return <FileText className="w-4 h-4" />;
            default: return <ChevronRight className="w-4 h-4" />;
        }
    };

    if (!showSearchModal) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 sm:px-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowSearchModal(false)}
                    className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
                />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                    onKeyDown={handleKeyDown}
                >
                    {/* Search Input Area */}
                    <div className="relative p-4 border-b border-gray-200 dark:border-gray-800">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for stocks, crypto, pages, users..."
                            className="w-full bg-transparent pl-10 pr-12 py-2 text-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 font-medium">
                                <Command className="w-2.5 h-2.5" /> K
                            </kbd>
                            <button 
                                onClick={() => setShowSearchModal(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {searchQuery.trim() === '' ? (
                            <div className="p-4 space-y-6">
                                {recentSearches.length > 0 && (
                                    <div>
                                        <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Searches</h3>
                                        <div className="space-y-1">
                                            {recentSearches.map((search, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => setSearchQuery(search)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group transition-colors"
                                                >
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span>{search}</span>
                                                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Navigation</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: 'Stock Market', icon: Activity, url: '/dashboard/stock-dashboard' },
                                            { label: 'Crypto Pulse', icon: Zap, url: '/dashboard/crypto' },
                                            { label: 'Cloud Reports', icon: FileText, url: '/dashboard/analytics' },
                                            { label: 'Settings', icon: Settings, url: '/dashboard/settings' }
                                        ].map((item, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => {
                                                    setShowSearchModal(false);
                                                    router.push(item.url);
                                                }}
                                                className="flex items-center gap-3 px-3 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors group"
                                            >
                                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                                    <item.icon className="w-4 h-4 text-indigo-500" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1 p-2">
                                {isSearching ? (
                                    <div className="p-8 text-center space-y-3">
                                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-sm text-gray-500 font-medium">Searching our neural network...</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((result, i) => (
                                        <button 
                                            key={result.id}
                                            onClick={() => handleResultClick(result)}
                                            onMouseEnter={() => setSelectedResultIndex(i)}
                                            className={clsx(
                                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group border-2",
                                                selectedResultIndex === i 
                                                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/50" 
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent"
                                            )}
                                        >
                                            <div className={clsx(
                                                "p-2.5 rounded-xl transition-colors",
                                                selectedResultIndex === i 
                                                    ? "bg-white dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                            )}>
                                                {getTypeIcon(result.type)}
                                            </div>
                                            <div className="text-left flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={clsx(
                                                        "text-sm font-bold",
                                                        selectedResultIndex === i ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"
                                                    )}>{result.title}</span>
                                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-black">{result.type}</span>
                                                </div>
                                                {result.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{result.description}</p>
                                                )}
                                            </div>
                                            <ChevronRight className={clsx(
                                                "w-4 h-4 transition-all",
                                                selectedResultIndex === i ? "opacity-100 translate-x-1" : "opacity-0"
                                            )} />
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto border border-gray-100 dark:border-gray-700">
                                            <X className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 dark:text-white font-bold">No results found</h4>
                                            <p className="text-sm text-gray-500 mt-1">We couldn't find anything matching "{searchQuery}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer / Shortcuts */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex items-center gap-6 justify-center">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] text-gray-400">Esc</kbd>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">to close</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] text-gray-400">↑↓</kbd>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">to navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] text-gray-400">Enter</kbd>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">to select</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
