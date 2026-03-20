'use client';

import React from 'react';
import Link from 'next/link';
import {
    Cookie,
    Shield,
    Settings,
    Info,
    AlertCircle,
    CheckCircle,
    Globe,
    Smartphone,
    FileText,
    ArrowLeft,
    Sliders,
    Eye,
    Database,
    Clock,
    Target
} from 'lucide-react';

export default function CookiePolicyPage() {
    const cookieTypes = [
        {
            name: 'Essential Cookies',
            description: 'Required for the website to function properly. These cannot be disabled.',
            examples: ['Authentication', 'Security', 'Session management'],
            icon: Shield,
            required: true
        },
        {
            name: 'Functional Cookies',
            description: 'Remember your preferences and choices to enhance your experience.',
            examples: ['Language preferences', 'Region selection', 'Saved settings'],
            icon: Settings,
            required: false
        },
        {
            name: 'Analytics Cookies',
            description: 'Help us understand how visitors interact with our platform.',
            examples: ['Page visits', 'Click tracking', 'Usage patterns'],
            icon: Eye,
            required: false
        },
        {
            name: 'Marketing Cookies',
            description: 'Used to deliver relevant advertisements and track campaign performance.',
            examples: ['Ad personalization', 'Campaign tracking', 'Social media integration'],
            icon: Target,
            required: false
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg">
                                <Cookie className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
                        <p className="text-xl text-white/90 mb-8">How we use cookies and similar technologies</p>
                        <div className="flex items-center justify-center gap-4 text-sm text-white/80">
                            <span>Last Updated: February 19, 2026</span>
                            <span>•</span>
                            <span>Version 1.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Link */}
            <div className="container mx-auto px-4 py-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">

                    {/* Introduction */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Are Cookies?</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                                    They are widely used to make websites work more efficiently and provide valuable information to website owners.
                                    This policy explains how ABC uses cookies and similar technologies to recognize you when you visit our platform.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cookie Consent Banner Preview */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cookie Consent Preview</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    When you first visit our site, you'll see a banner like this:
                                </p>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.
                                    </p>
                                    <div className="flex gap-3">
                                        <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                                            Accept All
                                        </button>
                                        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                            Cookie Settings
                                        </button>
                                        <button className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Types of Cookies */}
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Types of Cookies We Use</h2>

                    <div className="space-y-6 mb-8">
                        {cookieTypes.map((cookie, index) => (
                            <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <cookie.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cookie.name}</h3>
                                            {cookie.required && (
                                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                                                    Required
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-3">{cookie.description}</p>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Examples:</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {cookie.examples.map((example, i) => (
                                                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400">{example}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cookie Settings */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sliders className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Managing Your Cookie Preferences</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    You can control and manage cookies in various ways. Please note that removing or blocking cookies
                                    may impact your user experience and some functionality may no longer be available.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Browser settings to block or delete cookies</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Our cookie consent banner to adjust preferences</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Third-party opt-out tools</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Third-Party Cookies */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Third-Party Cookies</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    In addition to our own cookies, we may also use various third-party cookies to report usage statistics,
                                    deliver advertisements, and improve our services. These include:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
                                    <li><strong>Google Analytics:</strong> To analyze website traffic</li>
                                    <li><strong>Stripe:</strong> For payment processing</li>
                                    <li><strong>Intercom:</strong> For customer support</li>
                                    <li><strong>Segment:</strong> For data integration</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Cookie Duration */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How Long Do Cookies Last?</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Session Cookies</h3>
                                        <p className="text-gray-600 dark:text-gray-400">These are temporary cookies that expire when you close your browser.</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Persistent Cookies</h3>
                                        <p className="text-gray-600 dark:text-gray-400">These remain on your device until they expire or you delete them. Durations vary from 24 hours to 2 years.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Updates to Policy */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Updates to This Policy</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    We may update this Cookie Policy from time to time to reflect changes in technology, regulation,
                                    or our business practices. Any changes will be posted on this page with an updated revision date.
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    If you have questions about our use of cookies, please contact us at{' '}
                                    <a href="mailto:privacy@abc.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                        privacy@abc.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}