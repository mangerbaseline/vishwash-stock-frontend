'use client';

import React from 'react';
import Link from 'next/link';
import {
    Shield,
    FileText,
    Scale,
    AlertCircle,
    CheckCircle,
    ArrowLeft,
    BookOpen,
    Gavel,
    UserCheck,
    Lock,
    CreditCard,
    Ban,
    Globe,
    Mail
} from 'lucide-react';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-lg">
                                <Scale className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-xl text-white/90 mb-8">Please read these terms carefully before using ABC</p>
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
                        <div className="flex gap-6">
                            <a href="#agreement" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Agreement</a>
                            <a href="#eligibility" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Eligibility</a>
                            <a href="#accounts" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Accounts</a>
                            <a href="#content" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Content</a>
                            <a href="#termination" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Termination</a>
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
                                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to ABC</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    These Terms of Service ("Terms") govern your access to and use of ABC's website, products,
                                    and services ("Services"). By accessing or using our Services, you agree to be bound by these
                                    Terms. If you do not agree to these Terms, please do not use our Services.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Agreement to Terms */}
                    <div id="agreement" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Agreement to Terms</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                    <p>
                                        By registering for, downloading, or using the Services, you agree to be bound by these Terms,
                                        including any additional terms and conditions that may apply to specific Services. If you are
                                        using the Services on behalf of an organization, you represent and warrant that you have the
                                        authority to bind that organization to these Terms.
                                    </p>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                            <strong>⚠️ Important:</strong> These Terms contain important information about your rights
                                            and obligations. Please read them carefully.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility */}
                    <div id="eligibility" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Eligibility</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                    <p>By using our Services, you represent and warrant that:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>You are at least 18 years of age or the age of majority in your jurisdiction</li>
                                        <li>You have the full power and authority to enter into these Terms</li>
                                        <li>You will provide accurate and complete information when creating an account</li>
                                        <li>Your use of the Services complies with all applicable laws and regulations</li>
                                        <li>You are not located in a country that is subject to trade sanctions</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Accounts */}
                    <div id="accounts" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                    <p>When you create an account with us, you are responsible for:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Maintaining the confidentiality of your account credentials</li>
                                        <li>All activities that occur under your account</li>
                                        <li>Notifying us immediately of any unauthorized use of your account</li>
                                        <li>Ensuring that your account information is accurate and up-to-date</li>
                                    </ul>
                                    <p className="mt-4">We reserve the right to suspend or terminate accounts that violate these Terms or are inactive for extended periods.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Content */}
                    <div id="content" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. User Content</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                    <p>You retain ownership of any content you submit, post, or display on or through the Services. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Host, store, and display your content</li>
                                        <li>Modify and adapt your content for technical compatibility</li>
                                        <li>Use your content to improve our Services</li>
                                    </ul>
                                    <p>You represent that you have all necessary rights to the content you submit and that it does not violate any third-party rights.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prohibited Conduct */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Prohibited Conduct</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                    <p>You agree not to engage in any of the following prohibited activities:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Using the Services for any illegal purpose</li>
                                        <li>Attempting to gain unauthorized access to our systems</li>
                                        <li>Interfering with the proper functioning of the Services</li>
                                        <li>Collecting user information without consent</li>
                                        <li>Impersonating any person or entity</li>
                                        <li>Uploading malicious code or viruses</li>
                                        <li>Engaging in any activity that disrupts or interferes with the Services</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Termination */}
                    <div id="termination" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 scroll-mt-20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Termination</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                    <p>We may terminate or suspend your account and access to the Services at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.</p>
                                    <p>Upon termination, your right to use the Services will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive termination.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer of Warranties */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Disclaimer of Warranties</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                                    EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF
                                    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
                                    THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Limitation of Liability */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Gavel className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Limitation of Liability</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ABC BE LIABLE FOR ANY INDIRECT,
                                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA,
                                    OR USE, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE USE OF THE SERVICES.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Governing Law */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Governing Law</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    These Terms shall be governed by the laws of [Your Jurisdiction], without regard to its
                                    conflict of law provisions. Any disputes arising under these Terms shall be resolved in
                                    the courts located in [Your Jurisdiction].
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Changes to Terms */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Changes to Terms</h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We reserve the right to modify these Terms at any time. We will provide notice of significant
                                    changes by posting the updated Terms on this page and updating the "Last Updated" date. Your
                                    continued use of the Services after such modifications constitutes your acceptance of the
                                    revised Terms.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    If you have any questions about these Terms, please contact us at:
                                </p>
                                <div className="space-y-2">
                                    <p className="text-gray-800 dark:text-gray-200">
                                        <strong>Email:</strong> legal@abc.com
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-200">
                                        <strong>Address:</strong> 123 Business Street, Suite 100, City, State 12345
                                    </p>
                                    <p className="text-gray-800 dark:text-gray-200">
                                        <strong>Phone:</strong> +1 (555) 123-4567
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Acceptance */}
                    <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        <p>By using ABC, you acknowledge that you have read and understood these Terms of Service.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}