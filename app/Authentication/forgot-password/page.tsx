'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { forgotPassword } from '../../lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🔵 Form submitted with email:', email);

        setError('');
        setSuccess(false);
        setDebugInfo('');

        // Validate email
        if (!email.trim()) {
            console.log('❌ No email entered');
            setError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format:', email);
            setError('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            console.log('📤 Calling forgotPassword API with:', email);
            setDebugInfo('Sending request to server...');

            const response = await forgotPassword(email);
            console.log('✅ API Response:', response);
            setDebugInfo('Response received: ' + JSON.stringify(response));

            setSuccess(true);
            setSubmittedEmail(email);
            setEmail('');
        } catch (err: any) {
            console.error('❌ Error in handleSubmit:', err);
            setDebugInfo('Error: ' + err.message);
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Sign In */}
                <Link
                    href="/Authentication/signin"
                    className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Sign In
                </Link>

                {/* Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">

                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Forgot Password?
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Enter your email and we'll send you a reset link.
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Mail className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {success ? (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Check Your Email
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    We've sent a password reset link to:
                                </p>
                                <p className="font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 py-3 px-4 rounded-lg mb-6">
                                    {submittedEmail}
                                </p>
                                <Link
                                    href="/Authentication/signin"
                                    className="inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
                                >
                                    Return to Sign In
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Debug Info - Remove in production */}
                                {debugInfo && (
                                    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-3">
                                        <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                            Debug: {debugInfo}
                                        </p>
                                    </div>
                                )}

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your registered email"
                                            className="w-full px-4 py-4 pl-12 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-colors"
                                            disabled={loading}
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Reset Link
                                                <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>

                                {/* Sign In Link */}
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    Remember your password?{' '}
                                    <Link
                                        href="/Authentication/signin"
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}