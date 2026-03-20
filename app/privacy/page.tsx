'use client';

import React from 'react';
import Link from 'next/link';
import {
    Shield,
    Lock,
    Eye,
    Database,
    Cookie,
    Share2,
    Trash2,
    UserCheck,
    Mail,
    ArrowLeft,
    Globe,
    Smartphone,
    CreditCard,
    FileText,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg">
                                <Shield className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-xl text-white/90 mb-8">How we collect, use, and protect your data</p>
                        <div className="flex items-center justify-center gap-4 text-sm text-white/80">
                            <span>Last Updated: February 19, 2026</span>
                            <span>•</span>
                            <span>Version 1.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                        <div className="flex gap-6 overflow-x-auto pb-2">
                            <a href="#information" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">Information</a>
                            <a href="#usage" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">How We Use</a>
                            <a href="#sharing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">Sharing</a>
                            <a href="#security" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">Security</a>
                            <a href="#rights" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">Your Rights</a>
                            <a href="#cookies" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">

                    {/* Introduction */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Commitment to Privacy</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    At ABC, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                                    disclose, and safeguard your information when you use our platform. Please read this privacy
                                    policy carefully. If you do not agree with the terms of this privacy policy, please do not
                                    access the platform.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Information We Collect */}
                    <div id="information" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>

                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Personal Information</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">We may collect the following personal information:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                                    <li>Name and username</li>
                                    <li>Email address</li>
                                    <li>Phone number</li>
                                    <li>Profile photo</li>
                                    <li>Account credentials (hashed passwords)</li>
                                    <li>Billing information (if applicable)</li>
                                </ul>

                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Usage Information</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">We automatically collect:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                                    <li>Device information (browser type, IP address, operating system)</li>
                                    <li>Log data and activity on our platform</li>
                                    <li>Cookies and similar tracking technologies</li>
                                    <li>Location information (general location from IP address)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* How We Use Your Information */}
                    <div id="usage" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">We use the information we collect to:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Account Management</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage your account, authenticate you, and provide customer support</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Service Improvement</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Analyze usage patterns to improve our platform and develop new features</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Communications</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Send you important updates, security alerts, and support messages</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Detect and prevent fraud, abuse, and security incidents</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Sharing */}
                    <div id="sharing" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Information Sharing</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">We do not sell your personal information. We may share your information with:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                                    <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform (hosting, analytics, customer support)</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                    <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Data Security */}
                    <div id="security" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Security</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">We implement industry-standard security measures:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600 dark:text-gray-400">Encryption of data in transit (SSL/TLS)</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600 dark:text-gray-400">Secure password hashing (bcrypt)</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600 dark:text-gray-400">Regular security audits</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-600 dark:text-gray-400">Access controls and authentication</span>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">While we strive to protect your data, no method of transmission over the Internet is 100% secure.</p>
                            </div>
                        </div>
                    </div>

                    {/* Your Rights */}
                    <div id="rights" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <UserCheck className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Your Rights</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">Depending on your location, you may have the right to:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                                    <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
                                    <li><strong>Restriction:</strong> Limit how we use your information</li>
                                    <li><strong>Portability:</strong> Receive your information in a portable format</li>
                                    <li><strong>Opt-out:</strong> Withdraw consent for certain data uses</li>
                                </ul>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">To exercise these rights, please contact us at privacy@abc.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Cookies */}
                    <div id="cookies" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Cookie className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Cookies and Tracking</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">We use cookies and similar technologies to:</p>
                                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                                    <li>Keep you logged in</li>
                                    <li>Remember your preferences</li>
                                    <li>Analyze how you use our platform</li>
                                    <li>Improve user experience</li>
                                </ul>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">You can control cookies through your browser settings, but disabling them may affect functionality.</p>
                            </div>
                        </div>
                    </div>

                    {/* Children's Privacy */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Smartphone className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Children's Privacy</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Our platform is not intended for individuals under the age of 18. We do not knowingly collect
                                    personal information from children. If you become aware that a child has provided us with
                                    personal information, please contact us immediately.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* International Data Transfers */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Globe className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. International Data Transfers</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Your information may be transferred to and processed in countries other than your own.
                                    We ensure appropriate safeguards are in place to protect your information in accordance
                                    with this Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Changes to Policy */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Changes to This Policy</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We may update this Privacy Policy from time to time. We will notify you of significant
                                    changes by posting the new policy on this page and updating the "Last Updated" date.
                                    Your continued use of the platform after changes constitutes acceptance of the revised policy.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Us */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    If you have questions or concerns about this Privacy Policy or our data practices:
                                </p>
                                <div className="space-y-2">
                                    <p className="text-gray-800 dark:text-gray-200">
                                        <strong>Email:</strong> privacy@abc.com
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-200">
                                        <strong>Data Protection Officer:</strong> dpo@abc.com
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-200">
                                        <strong>Address:</strong> 123 Business Street, Suite 100, City, State 12345
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Processing Agreement */}
                    <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                <strong>GDPR and CCPA Compliance:</strong> If you are a resident of the European Economic Area (EEA) or California,
                                you have additional rights under GDPR and CCPA respectively. Please contact us to exercise these rights.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}