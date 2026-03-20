'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Award,
    BarChart3,
    Briefcase,
    ChevronRight,
    Clock,
    Globe,
    Heart,
    Mail,
    MapPin,
    Phone,
    Rocket,
    Shield,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users,
    Zap,
    CheckCircle,
    Quote,
    Github,
    Linkedin,
    Twitter,
    ArrowRight
} from 'lucide-react';

export default function AboutPage() {
    const teamMembers = [
        {
            name: 'Alex Chen',
            role: 'Founder & CEO',
            bio: 'Former Wall Street analyst with 15+ years of experience in algorithmic trading.',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
            social: { twitter: '#', linkedin: '#', github: '#' }
        },
        {
            name: 'Sarah Johnson',
            role: 'CTO',
            bio: 'Tech visionary with expertise in high-frequency trading systems and AI.',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
            social: { twitter: '#', linkedin: '#', github: '#' }
        },
        {
            name: 'Michael Zhang',
            role: 'Head of Data Science',
            bio: 'PhD in Machine Learning, leading our predictive analytics team.',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
            social: { twitter: '#', linkedin: '#', github: '#' }
        },
        {
            name: 'Emily Rodriguez',
            role: 'Product Manager',
            bio: 'Passionate about creating intuitive financial tools for investors.',
            image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
            social: { twitter: '#', linkedin: '#', github: '#' }
        },
        {
            name: 'David Kim',
            role: 'Lead Engineer',
            bio: 'Full-stack expert specializing in real-time data processing.',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
            social: { twitter: '#', linkedin: '#', github: '#' }
        },
        {
            name: 'Lisa Patel',
            role: 'Customer Success',
            bio: 'Dedicated to helping investors achieve their financial goals.',
            image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
            social: { twitter: '#', linkedin: '#', github: '#' }
        }
    ];

    const values = [
        {
            icon: Shield,
            title: 'Trust & Security',
            description: 'Bank-grade encryption and security protocols to protect your data and investments.'
        },
        {
            icon: Zap,
            title: 'Innovation',
            description: 'Constantly pushing boundaries with cutting-edge technology and AI-driven insights.'
        },
        {
            icon: Users,
            title: 'User-Centric',
            description: 'Every feature is designed with our users\' needs and goals in mind.'
        },
        {
            icon: TrendingUp,
            title: 'Transparency',
            description: 'Clear, honest communication about data, pricing, and platform capabilities.'
        },
        {
            icon: Clock,
            title: 'Reliability',
            description: '99.9% uptime guarantee with real-time data you can count on.'
        },
        {
            icon: Heart,
            title: 'Community',
            description: 'Building a community of informed, successful investors.'
        }
    ];

    const milestones = [
        {
            year: '2020',
            title: 'The Beginning',
            description: 'ABC was founded with a vision to democratize stock market data.',
            icon: Rocket
        },
        {
            year: '2021',
            title: 'First 10K Users',
            description: 'Reached 10,000 active users and raised seed funding.',
            icon: Users
        },
        {
            year: '2022',
            title: 'AI Analytics Launch',
            description: 'Introduced AI-powered predictive analytics platform.',
            icon: Sparkles
        },
        {
            year: '2023',
            title: 'Global Expansion',
            description: 'Expanded to 15 countries with multi-language support.',
            icon: Globe
        },
        {
            year: '2024',
            title: 'Enterprise Solution',
            description: 'Launched enterprise-grade solutions for institutions.',
            icon: Briefcase
        },
        {
            year: '2025',
            title: '1M+ Investors',
            description: 'Proudly serving over 1 million investors worldwide.',
            icon: Award
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative container mx-auto px-4 py-24 md:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-8 backdrop-blur-lg">
                            <Rocket className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Empowering Investors
                            <span className="block text-2xl md:text-3xl mt-2 text-white/80">
                                with Intelligent Data
                            </span>
                        </h1>
                        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                            We're on a mission to make stock market data accessible, understandable,
                            and actionable for everyone, from beginners to institutional investors.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/Authentication/signup"
                                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#story"
                                className="px-8 py-4 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="relative border-t border-white/20">
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { value: '1M+', label: 'Active Users' },
                                { value: '50K+', label: 'Daily Trades' },
                                { value: '99.9%', label: 'Uptime' },
                                { value: '15+', label: 'Countries' },
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-white/80 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Story Section */}
            <div id="story" className="container mx-auto px-4 py-20 scroll-mt-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            Founded in 2020, ABC began with a simple observation: the stock market was becoming
                            increasingly accessible to retail investors, but the tools to analyze it remained
                            complex and expensive. Traditional platforms were built for institutions, leaving
                            individual investors at a disadvantage.
                        </p>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            Our founder, Alex Chen, a former Wall Street analyst, saw an opportunity to level
                            the playing field. He assembled a team of passionate engineers, data scientists,
                            and finance experts to build a platform that combines institutional-grade analytics
                            with an intuitive, user-friendly interface.
                        </p>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            Today, ABC serves over 1 million investors worldwide, providing real-time data,
                            AI-powered insights, and advanced analytics that were once only available to
                            hedge funds and professional traders. But we're just getting started.
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Values */}
            <div className="bg-white/50 dark:bg-gray-800/50 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700 group"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <value.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Our Journey Timeline */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Journey</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Key milestones that shaped our company
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Timeline Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-indigo-500 to-purple-600 hidden md:block"></div>

                    <div className="space-y-12">
                        {milestones.map((milestone, index) => (
                            <div key={index} className={`flex flex-col md:flex-row ${index % 2 === 0 ? '' : 'md:flex-row-reverse'} items-center gap-8`}>
                                <div className="flex-1 md:text-right">
                                    {index % 2 === 0 ? (
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{milestone.year}</h3>
                                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{milestone.title}</h4>
                                            <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                                        </div>
                                    ) : (
                                        <div className="md:hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{milestone.year}</h3>
                                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{milestone.title}</h4>
                                            <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <milestone.icon className="w-8 h-8 text-white" />
                                </div>

                                <div className="flex-1">
                                    {index % 2 !== 0 ? (
                                        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{milestone.year}</h3>
                                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{milestone.title}</h4>
                                            <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                                        </div>
                                    ) : (
                                        <div className="hidden md:block"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="bg-white/50 dark:bg-gray-800/50 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Team</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Passionate experts dedicated to your success
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700 group"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">{member.role}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{member.bio}</p>
                                    <div className="flex gap-3">
                                        <a href={member.social.twitter} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                        <a href={member.social.linkedin} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                        <a href={member.social.github} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            <Github className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Users Say</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Trusted by investors worldwide
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {[
                        {
                            quote: "ABC has completely transformed how I analyze stocks. The AI insights are incredibly accurate.",
                            author: "James Wilson",
                            role: "Retail Investor",
                            rating: 5
                        },
                        {
                            quote: "As a professional trader, I need reliable data. ABC delivers with 99.9% uptime and real-time updates.",
                            author: "Maria Garcia",
                            role: "Day Trader",
                            rating: 5
                        },
                        {
                            quote: "The best platform for both beginners and experts. The educational resources are invaluable.",
                            author: "Robert Chen",
                            role: "Portfolio Manager",
                            rating: 5
                        }
                    ].map((testimonial, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 relative">
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-indigo-200 dark:text-indigo-900/30" />
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 italic">"{testimonial.quote}"</p>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
                        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                            Have questions? We'd love to hear from you.
                        </p>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                                <MapPin className="w-8 h-8 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Visit Us</h3>
                                <p className="text-sm text-white/80">
                                    123 Business Street<br />
                                    Suite 100<br />
                                    New York, NY 10001
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                                <Phone className="w-8 h-8 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Call Us</h3>
                                <p className="text-sm text-white/80">
                                    +1 (555) 123-4567<br />
                                    Mon-Fri, 9am-6pm EST
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                                <Mail className="w-8 h-8 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Email Us</h3>
                                <p className="text-sm text-white/80">
                                    support@abc.com<br />
                                    sales@abc.com
                                </p>
                            </div>
                        </div>

                        <div className="mt-12">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                Contact Us
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join over 1 million investors already using ABC to make smarter investment decisions.
                    </p>
                    <Link
                        href="/Authentication/signup"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                    >
                        Get Started for Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-sm text-white/80 mt-4">No credit card required. 14-day free trial.</p>
                </div>
            </div>
        </div>
    );
}