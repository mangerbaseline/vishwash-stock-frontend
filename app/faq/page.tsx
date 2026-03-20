'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    HelpCircle,
    Search,
    ChevronDown,
    ChevronUp,
    CreditCard,
    User,
    Lock,
    BarChart3,
    TrendingUp,
    Wallet,
    Phone,
    Mail,
    MessageCircle,
    FileText,
    ArrowLeft,
    Shield,
    Zap,
    Globe
} from 'lucide-react';

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openCategories, setOpenCategories] = useState<string[]>([]);
    const [openQuestions, setOpenQuestions] = useState<string[]>([]);

    const faqData = [
        {
            category: 'Getting Started',
            icon: User,
            questions: [
                {
                    q: 'How do I create an account?',
                    a: 'Creating an account is free and takes less than 2 minutes. Click the "Sign Up" button, enter your email, create a username and password, and verify your email address. You can start exploring stocks immediately!'
                },
                {
                    q: 'Is ABC really free?',
                    a: 'Yes! We offer a free tier with access to basic stock data, watchlists, and portfolio tracking. For advanced features like AI insights, real-time alerts, and historical data, we offer affordable premium plans.'
                },
                {
                    q: 'What do I need to start using ABC?',
                    a: 'All you need is a valid email address and an internet connection. No credit card required for the free tier. You can start tracking stocks and building your watchlist right away.'
                },
                {
                    q: 'Can I use ABC on my mobile phone?',
                    a: 'Absolutely! Our platform is fully responsive and works on all devices. We also have native iOS and Android apps available for download from the App Store and Google Play Store.'
                }
            ]
        },
        {
            category: 'Account & Security',
            icon: Lock,
            questions: [
                {
                    q: 'How secure is my data?',
                    a: 'We use bank-grade 256-bit encryption for all data transmission. Your password is hashed using bcrypt, and we never store sensitive information in plain text. We also offer two-factor authentication for added security.'
                },
                {
                    q: 'How do I reset my password?',
                    a: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send you a password reset link. For security, the link expires after 1 hour.'
                },
                {
                    q: 'Can I change my username or email?',
                    a: 'Yes, you can update your profile information in the Account Settings page. Email changes require verification, and username changes are subject to availability.'
                },
                {
                    q: 'What is two-factor authentication?',
                    a: '2FA adds an extra layer of security by requiring a code from your phone in addition to your password. You can enable it in Security Settings using Google Authenticator or SMS.'
                }
            ]
        },
        {
            category: 'Stocks & Data',
            icon: BarChart3,
            questions: [
                {
                    q: 'Where does your stock data come from?',
                    a: 'We aggregate data from multiple premium sources including major stock exchanges, financial data providers, and real-time market feeds to ensure accuracy and reliability.'
                },
                {
                    q: 'How often is stock data updated?',
                    a: 'Premium users get real-time updates with sub-second latency. Free tier users receive data with a 15-minute delay for most exchanges.'
                },
                {
                    q: 'Do you support international stocks?',
                    a: 'Yes! We cover major global exchanges including NYSE, NASDAQ, LSE, Tokyo Exchange, Hong Kong Exchange, and many more. Check our coverage page for the complete list.'
                },
                {
                    q: 'What are AI-powered insights?',
                    a: 'Our AI analyzes historical patterns, market sentiment, and technical indicators to provide actionable insights and predictions. Available for Premium and Enterprise users.'
                }
            ]
        },
        {
            category: 'Billing & Payments',
            icon: CreditCard,
            questions: [
                {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans. All payments are processed securely through Stripe.'
                },
                {
                    q: 'Can I cancel my subscription anytime?',
                    a: 'Yes, you can cancel your subscription at any time from your account settings. There are no cancellation fees, and you\'ll continue to have access until the end of your billing period.'
                },
                {
                    q: 'Do you offer refunds?',
                    a: 'We offer a 14-day money-back guarantee for all paid plans. If you\'re not satisfied, contact our support team within 14 days of purchase for a full refund.'
                },
                {
                    q: 'What is the difference between plans?',
                    a: 'Free tier includes basic features. Premium adds real-time data, AI insights, and advanced analytics. Enterprise includes API access, dedicated support, and custom solutions.'
                }
            ]
        },
        {
            category: 'Technical Support',
            icon: HelpCircle,
            questions: [
                {
                    q: 'How do I contact support?',
                    a: 'You can reach us via live chat (available 24/7), email at support@abc.com, or phone at +1 (555) 123-4567 during business hours. Premium users get priority support.'
                },
                {
                    q: 'What are your support hours?',
                    a: 'Live chat is available 24/7. Phone support is available Monday-Friday, 9am-6pm EST. Email support typically responds within 2-4 hours during business days.'
                },
                {
                    q: 'Do you offer API access?',
                    a: 'Yes, Enterprise customers get full API access with documentation and dedicated support. Contact our sales team for more information about API plans.'
                },
                {
                    q: 'Is there a mobile app?',
                    a: 'Yes! Our mobile apps are available for iOS and Android. They include most features of the web platform plus push notifications for price alerts.'
                }
            ]
        }
    ];

    const toggleCategory = (category: string) => {
        setOpenCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleQuestion = (question: string) => {
        setOpenQuestions(prev =>
            prev.includes(question)
                ? prev.filter(q => q !== question)
                : [...prev, question]
        );
    };

    const filteredFaqs = faqData.map(category => ({
        ...category,
        questions: category.questions.filter(
            q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg">
                                <HelpCircle className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-xl text-white/90 mb-8">Find answers to common questions about ABC</p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
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

                    {/* Quick Categories */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                        {faqData.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    const element = document.getElementById(category.category);
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700 group"
                            >
                                <category.icon className="w-6 h-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{category.category}</span>
                            </button>
                        ))}
                    </div>

                    {/* FAQ Sections */}
                    <div className="space-y-8">
                        {filteredFaqs.map((category, idx) => (
                            <div key={idx} id={category.category} className="scroll-mt-20">
                                <div
                                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
                                    onClick={() => toggleCategory(category.category)}
                                >
                                    <div className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                <category.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category.category}</h2>
                                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                                                {category.questions.length} questions
                                            </span>
                                        </div>
                                        {openCategories.includes(category.category) ? (
                                            <ChevronUp className="w-6 h-6 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {openCategories.includes(category.category) && (
                                    <div className="mt-2 space-y-2">
                                        {category.questions.map((item, qIdx) => (
                                            <div
                                                key={qIdx}
                                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                                            >
                                                <div
                                                    className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                    onClick={() => toggleQuestion(`${category.category}-${qIdx}`)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                                                            {item.q}
                                                        </h3>
                                                        {openQuestions.includes(`${category.category}-${qIdx}`) ? (
                                                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    {openQuestions.includes(`${category.category}-${qIdx}`) && (
                                                        <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                                                            {item.a}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Still Have Questions */}
                    <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 text-center border border-indigo-200 dark:border-indigo-800">
                        <MessageCircle className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Still Have Questions?</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                            Can't find the answer you're looking for? Our support team is here to help.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/support"
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <Mail className="w-5 h-5" />
                                Contact Support
                            </Link>
                            <Link
                                href="/support#live-chat"
                                className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Live Chat
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}