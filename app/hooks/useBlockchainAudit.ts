// hooks/useBlockchainAudit.ts
import { useState, useCallback } from 'react';
import axios from 'axios';

interface TransactionRecord {
    transactionHash: string;
    type: string;
    witness: string;
    status: 'pending' | 'confirmed' | 'failed' | 'local';
    blockNumber?: number;
    blockchainTxHash?: string;
    createdAt: string;
}

interface VerificationResult {
    valid: boolean;
    record?: TransactionRecord;
    verifiedAt: string;
    error?: string;
}

export const useBlockchainAudit = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Record a transaction
    const recordTransaction = useCallback(async (type: string, data: any) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/blockchain/record', {
                type,
                data
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data.transaction;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to record transaction');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Verify a transaction
    const verifyTransaction = useCallback(async (transactionHash: string): Promise<VerificationResult> => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/blockchain/verify', {
                transactionHash
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to verify transaction');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get transaction history
    const getTransactionHistory = useCallback(async (limit: number = 50, type?: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/blockchain/history', {
                params: { limit, type },
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data.transactions;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch history');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get transaction by hash
    const getTransactionByHash = useCallback(async (hash: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/blockchain/transaction/${hash}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.transaction;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch transaction');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Validate transaction integrity
    const validateIntegrity = useCallback(async (hash: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/api/blockchain/validate/${hash}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to validate integrity');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        recordTransaction,
        verifyTransaction,
        getTransactionHistory,
        getTransactionByHash,
        validateIntegrity
    };
};