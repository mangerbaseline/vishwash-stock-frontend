// frontend/components/PaymentHandler.tsx
import { useSubscription } from '../contexts/SubscriptionContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PaymentHandlerProps {
    planId: string;
}

export default function PaymentHandler({ planId }: PaymentHandlerProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { updatePlan } = useSubscription();

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await updatePlan(planId, 'card');

            if (response.success) {
                router.push('/dashboard?upgraded=true');
            } else {
                alert(response.message || 'Payment failed');
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            alert(error.message || 'An error occurred during payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePayment}>
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
        </form>
    );
}