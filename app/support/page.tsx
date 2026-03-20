'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Mail,
    MessageCircle,
    Phone,
    Headphones,
    Clock,
    CheckCircle,
    Send,
    ArrowLeft,
    HelpCircle,
    FileText,
    Users,
    Zap,
    Globe,
    Twitter,
    Facebook,
    Youtube,
    Github,
    AlertCircle
} from 'lucide-react';

export default function SupportPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'normal'
    });
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Support form submitted:', formData);
        setFormSubmitted(true);
        setTimeout(() => setFormSubmitted(false), 5000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg">
                                <Headphones className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Customer Support</h1>
                        <p className="text-xl text-white/90 mb-8">We're here to help 24/7</p>
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
                <div className="max-w-6xl mx-auto">

                    {/* Quick Support Options */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Live Chat</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Chat with our support team in real-time</p>
                            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Start Chat
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Support</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Get a response within 2-4 hours</p>
                            <a href="mailto:support@abc.com" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block">
                                support@abc.com
                            </a>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Phone Support</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Mon-Fri, 9am-6pm EST</p>
                            <a href="tel:+15551234567" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block">
                                +1 (555) 123-4567
                            </a>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Form */}
                        <div className="md:col-span-2">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h2>

                                {formSubmitted && (
                                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <p className="text-green-600 dark:text-green-400">Message sent successfully! We'll respond within 24 hours.</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Priority Level
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                        >
                                            <option value="low">Low - General inquiry</option>
                                            <option value="normal">Normal - Need assistance</option>
                                            <option value="high">High - Urgent issue</option>
                                            <option value="critical">Critical - Account access problem</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            required
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                                            placeholder="Please describe your issue in detail..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
                                    >
                                        Send Message
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Response Times */}
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-600" />
                                    Response Times
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Live Chat</span>
                                        <span className="text-green-600 font-semibold">&lt; 2 minutes</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Email</span>
                                        <span className="text-blue-600 font-semibold">2-4 hours</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Phone</span>
                                        <span className="text-purple-600 font-semibold">&lt; 5 minutes</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Premium Support</span>
                                        <span className="text-indigo-600 font-semibold">&lt; 30 minutes</span>
                                    </div>
                                </div>
                            </div>

                            {/* Knowledge Base */}
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    Knowledge Base
                                </h3>
                                <div className="space-y-2">
                                    <Link href="/faq" className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                        <span className="font-medium text-gray-900 dark:text-white">Frequently Asked Questions</span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Find quick answers to common questions</p>
                                    </Link>
                                    <Link href="/guides" className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                        <span className="font-medium text-gray-900 dark:text-white">User Guides</span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Step-by-step tutorials and guides</p>
                                    </Link>
                                    <Link href="/api-docs" className="block p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                        <span className="font-medium text-gray-900 dark:text-white">API Documentation</span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">For developers and integrations</p>
                                    </Link>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-indigo-600" />
                                    System Status
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">API</span>
                                        <span className="flex items-center gap-1 text-green-600">
                                            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                                            Operational
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Website</span>
                                        <span className="flex items-center gap-1 text-green-600">
                                            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                                            Operational
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Database</span>
                                        <span className="flex items-center gap-1 text-green-600">
                                            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                                            Operational
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">WebSocket</span>
                                        <span className="flex items-center gap-1 text-green-600">
                                            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                                            Operational
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Last incident: 30 days ago
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}