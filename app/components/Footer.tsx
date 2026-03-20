'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Heart,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Linkedin,
    Github,
    Instagram,
    Youtube,
    ArrowUp,
    Shield,
    FileText,
    Cookie,
    HelpCircle,
    Briefcase,
    Users,
    BookOpen,
    Mail as MailIcon,
    Send,
    ChevronRight,
    Sparkles,
    Award,
    Clock,
    Globe
} from 'lucide-react';

export default function Footer() {
    const [showScrollTop, setShowScrollTop] = React.useState(false);
    const currentYear = new Date().getFullYear();

    // Handle scroll to show/hide scroll-to-top button
    React.useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white overflow-hidden">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="relative border-b border-gray-700/50">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-indigo-500/30">
                            <MailIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Stay Updated with ABC
                        </h3>
                        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                            Get the latest stock market insights, platform updates, and investment tips delivered to your inbox.
                        </p>
                        <form className="max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
                                >
                                    Subscribe
                                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-3">
                                By subscribing, you agree to our{' '}
                                <Link href="/terms" className="text-indigo-400 hover:underline">
                                    Terms
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-indigo-400 hover:underline">
                                    Privacy Policy
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="relative container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

                    {/* Company Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-50 animate-pulse" />
                                <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
                                    <span className="text-2xl font-bold text-white">A</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    ABC
                                </h2>
                                <p className="text-xs text-gray-400">Enterprise Stock Dashboard</p>
                            </div>
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed">
                            Empowering investors with real-time stock data, advanced analytics, and intelligent insights to make informed investment decisions.
                        </p>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Award className="w-4 h-4 text-indigo-400" />
                            <span>Trusted by 10,000+ investors</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <span>Real-time market data</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Shield className="w-4 h-4 text-indigo-400" />
                            <span>Bank-grade security</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { href: '/dashboard/stock-dashboard', label: 'Dashboard', icon: Sparkles },
                                { href: '/stocks', label: 'Stocks', icon: Briefcase },
                                { href: '/about', label: 'About Us', icon: Users },
                                { href: '/blog', label: 'Blog', icon: BookOpen },
                                { href: '/careers', label: 'Careers', icon: Briefcase },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                                    >
                                        <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                        <link.icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-400" />
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal & Support */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
                            Legal & Support
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { href: '/terms', label: 'Terms of Service', icon: FileText },
                                { href: '/privacy', label: 'Privacy Policy', icon: Shield },
                                { href: '/cookies', label: 'Cookie Policy', icon: Cookie },
                                { href: '/faq', label: 'FAQ', icon: HelpCircle },
                                { href: '/support', label: 'Support', icon: Mail },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                                    >
                                        <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                        <link.icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-400" />
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
                            Contact Us
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 group">
                                <div className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                    <MapPin className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Address</p>
                                    <p className="text-sm text-white">123 Business Street, Suite 100<br />New York, NY 10001</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 group">
                                <div className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                    <Phone className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Phone</p>
                                    <p className="text-sm text-white">+1 (555) 123-4567</p>
                                    <p className="text-sm text-white">+1 (555) 765-4321</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 group">
                                <div className="w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                    <Mail className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Email</p>
                                    <p className="text-sm text-white">support@abc.com</p>
                                    <p className="text-sm text-white">sales@abc.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="pt-4">
                            <h4 className="text-sm font-semibold text-white mb-3">Follow Us</h4>
                            <div className="flex gap-3">
                                {[
                                    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:bg-blue-600' },
                                    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:bg-sky-500' },
                                    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:bg-blue-700' },
                                    { icon: Github, href: 'https://github.com', label: 'GitHub', color: 'hover:bg-gray-700' },
                                    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:bg-pink-600' },
                                    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:bg-red-600' },
                                ].map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-10 h-10 bg-gray-800/50 rounded-lg flex items-center justify-center hover:scale-110 transition-all duration-300 ${social.color} group`}
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 pt-8 border-t border-gray-700/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Shield, text: '256-bit Encryption' },
                            { icon: Award, text: 'ISO 27001 Certified' },
                            { icon: Globe, text: 'Global Coverage' },
                            { icon: Clock, text: '24/7 Support' },
                        ].map((badge, index) => (
                            <div key={index} className="flex items-center gap-3 justify-center md:justify-start">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                    <badge.icon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <span className="text-sm text-gray-300">{badge.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-6 border-t border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>© {currentYear} ABC. All rights reserved.</span>
                        <span className="hidden md:inline">•</span>
                        <Link href="/sitemap" className="hover:text-indigo-400 transition-colors">
                            Sitemap
                        </Link>
                        <span className="hidden md:inline">•</span>
                        <Link href="/accessibility" className="hover:text-indigo-400 transition-colors">
                            Accessibility
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            Made with <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> in NYC
                        </span>
                    </div>

                    {/* Language Selector */}
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <select className="bg-gray-800/50 text-gray-300 text-sm border border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500">
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center group animate-bounce-in"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                </button>
            )}
        </footer>
    );
}