'use client';

import { useState, useEffect } from 'react';
import { Check, X, Crown, Zap, Star, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
// import { useAuth } from '../lib/auth';

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
    popular?: boolean;
    features: {
        name: string;
        included: boolean;
    }[];
}

export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    // const { user } = useAuth();

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await fetch('/api/subscription/plans');
            const data = await response.json();
            if (data.success) {
                setPlans(data.plans);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = (planId: string) => {
        // if (!user) {
        //     router.push('/Authentication/signin?redirect=pricing');
        //     return;
        // }

        if (planId === 'free') {
            router.push('/dashboard/stock-dashboard');
        } else {
            router.push(`/pricing/checkout?plan=${planId}&interval=${billingInterval}`);
        }
    };

    const getPlanIcon = (planName: string) => {
        switch (planName.toLowerCase()) {
            case 'free':
                return <Star className="w-6 h-6 text-gray-400 dark:text-gray-400" />;
            case 'basic':
                return <Zap className="w-6 h-6 text-blue-400 dark:text-blue-400" />;
            case 'premium':
                return <Crown className="w-6 h-6 text-yellow-400 dark:text-yellow-400" />;
            case 'enterprise':
                return <Sparkles className="w-6 h-6 text-purple-400 dark:text-purple-400" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Header />

            <main className="container mx-auto px-4 py-16">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
                        Unlock the power of AI-driven stock market analysis
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={() => setBillingInterval('month')}
                            className={`px-4 py-2 rounded-lg transition-all duration-300 ${billingInterval === 'month'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval('year')}
                            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center ${billingInterval === 'year'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative transition-all duration-300 ${plan.popular ? 'scale-105' : ''
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <Card className={`overflow-hidden border-2 transition-all duration-300 ${plan.popular
                                    ? 'border-blue-500 dark:border-blue-400'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                }`}>
                                <div className="p-6 bg-white dark:bg-gray-800 transition-colors duration-300">
                                    {/* Plan Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            {getPlanIcon(plan.name)}
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                                {plan.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                            ${billingInterval === 'year' ? (plan.price * 12 * 0.8).toFixed(2) : plan.price}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400 ml-2 transition-colors duration-300">
                                            /{billingInterval === 'year' ? 'year' : 'month'}
                                        </span>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 mb-8">
                                        {plan.features.map((feature, index) => (
                                            <div key={index} className="flex items-start space-x-2">
                                                {feature.included ? (
                                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <X className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                                                )}
                                                <span className={`text-sm transition-colors duration-300 ${feature.included
                                                        ? 'text-gray-700 dark:text-gray-200'
                                                        : 'text-gray-400 dark:text-gray-600'
                                                    }`}>
                                                    {feature.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={() => handleSubscribe(plan.id)}
                                        className={`w-full transition-all duration-300 ${plan.id === 'free'
                                                ? 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                            } text-white font-semibold py-3`}
                                    >
                                        {plan.id === 'free' ? 'Get Started' : 'Upgrade Now'}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Feature Comparison Table */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8 transition-colors duration-300">
                        Compare Features
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                    <th className="p-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">Feature</th>
                                    {plans.map((plan) => (
                                        <th key={plan.id} className="p-4 text-gray-900 dark:text-white text-center transition-colors duration-300">
                                            {plan.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {plans[0]?.features.map((feature, index) => (
                                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
                                        <td className="p-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">{feature.name}</td>
                                        {plans.map((plan) => (
                                            <td key={plan.id} className="p-4 text-center">
                                                {plan.features[index]?.included ? (
                                                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <X className="w-5 h-5 text-gray-400 dark:text-gray-600 mx-auto" />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8 transition-colors duration-300">
                        Frequently Asked Questions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                q: "Can I switch plans later?",
                                a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
                            },
                            {
                                q: "Is there a free trial?",
                                a: "Yes, we offer a 14-day free trial on our Premium plan. No credit card required."
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We accept all major credit cards, PayPal, and cryptocurrency payments."
                            },
                            {
                                q: "Can I cancel anytime?",
                                a: "Yes, you can cancel your subscription at any time. No hidden fees or cancellation charges."
                            }
                        ].map((faq, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg transition-colors duration-300"
                            >
                                <h3 className="text-gray-900 dark:text-white font-semibold mb-2 transition-colors duration-300">
                                    {faq.q}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}