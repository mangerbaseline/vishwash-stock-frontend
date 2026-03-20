'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Export the SearchResultType
export type SearchResultType = 'user' | 'dashboard' | 'report' | 'page' | 'setting' | 'admin' | 'crypto' | 'analytics';

// Export the SearchResult interface
export interface SearchResult {
    id: string;
    title: string;
    description?: string;
    type: SearchResultType;
    url: string;
    icon?: string;
    category?: string;
    tags?: string[];
    metadata?: any;
}

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResults: SearchResult[];
    setSearchResults: (results: SearchResult[]) => void;
    isSearching: boolean;
    setIsSearching: (isSearching: boolean) => void;
    recentSearches: string[];
    addToRecentSearches: (query: string) => void;
    clearRecentSearches: () => void;
    searchHistory: SearchResult[];
    addToSearchHistory: (result: SearchResult) => void;
    selectedResultIndex: number;
    setSelectedResultIndex: React.Dispatch<React.SetStateAction<number>>;
    showSearchModal: boolean;
    setShowSearchModal: (show: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
    const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
    const [showSearchModal, setShowSearchModal] = useState(false);

    const addToRecentSearches = (query: string) => {
        if (!query.trim()) return;
        setRecentSearches(prev => {
            const filtered = prev.filter(q => q !== query);
            return [query, ...filtered].slice(0, 10);
        });
    };

    const addToSearchHistory = (result: SearchResult) => {
        setSearchHistory(prev => {
            const filtered = prev.filter(r => r.id !== result.id);
            return [result, ...filtered].slice(0, 20);
        });
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
    };

    return (
        <SearchContext.Provider value={{
            searchQuery,
            setSearchQuery,
            searchResults,
            setSearchResults,
            isSearching,
            setIsSearching,
            recentSearches,
            addToRecentSearches,
            clearRecentSearches,
            searchHistory,
            addToSearchHistory,
            selectedResultIndex,
            setSelectedResultIndex,
            showSearchModal,
            setShowSearchModal
        }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}