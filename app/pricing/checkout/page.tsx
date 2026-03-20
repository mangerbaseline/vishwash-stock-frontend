'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Lock, Shield } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<any>(null);

    const planId = searchParams.get('plan');
    const interval = searchParams.get('interval');

    useEffect(() => {
        fetchPlanDetails();
    }, [planId]);

    const fetchPlanDetails = async () => {
        try {
            const response = await fetch('/api/subscription/plans');
            const data = await response.json();
            if (data.success) {
                const selectedPlan = data.plans.find((p: any) => p.id === planId);
                setPlan(selectedPlan);
            }
        } catch (error) {
            console.error('Error fetching plan:', error);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/subscription/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId,
                    paymentMethod: 'card'
                })
            });

            const data = await response.json();
            if (data.success) {
                router.push('/dashboard/stock-dashboard?upgraded=true');
            } else {
                alert(data.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('An error occurred during payment');
        } finally {
            setLoading(false);
        }
    };

    if (!plan) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">
                    Complete Your Purchase
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                            <div className="p-6 bg-white dark:bg-gray-800 transition-colors duration-300">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                                    Payment Details
                                </h2>

                                <form onSubmit={handlePayment} className="space-y-6">
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                            Card Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                                                required
                                            />
                                            <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                                CVC
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                            Name on Card
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-400/10 p-4 rounded-lg transition-colors duration-300">
                                        <Lock className="w-5 h-5" />
                                        <span className="text-sm">Your payment information is encrypted and secure</span>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Processing...' : `Pay $${interval === 'year' ? (plan.price * 12 * 0.8).toFixed(2) : plan.price}`}
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="md:col-span-1">
                        <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 sticky top-24 transition-colors duration-300">
                            <div className="p-6 bg-white dark:bg-gray-800 transition-colors duration-300">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                                    Order Summary
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                        <span>{plan.name} Plan ({interval})</span>
                                        <span className="font-medium">${interval === 'year' ? (plan.price * 12 * 0.8).toFixed(2) : plan.price}</span>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 transition-colors duration-300">
                                        <div className="flex justify-between text-gray-900 dark:text-white font-semibold transition-colors duration-300">
                                            <span>Total</span>
                                            <span>${interval === 'year' ? (plan.price * 12 * 0.8).toFixed(2) : plan.price}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                                        <Shield className="w-4 h-4" />
                                        <span>Secure Payment</span>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                                            What's included:
                                        </h3>
                                        <ul className="space-y-2">
                                            {plan.features?.slice(0, 3).map((feature: any, index: number) => (
                                                feature.included && (
                                                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2 transition-colors duration-300">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                        <span>{feature.name}</span>
                                                    </li>
                                                )
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Header />
            <Suspense fallback={
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            }>
                <CheckoutContent />
            </Suspense>
            <Footer />
        </div>
    );
}