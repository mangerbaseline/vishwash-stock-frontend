const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

class SubscriptionService {
    // Get token from localStorage
    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    // Get current subscription
    async getCurrentSubscription() {
        try {
            const token = this.getToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/subscription/current`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch subscription');
            }

            return data;
        } catch (error) {
            console.error('Error fetching subscription:', error);
            throw error;
        }
    }

    // Update subscription
    async updateSubscription(planId, paymentMethod = 'card') {
        try {
            const token = this.getToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/subscription/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId,
                    paymentMethod
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update subscription');
            }

            return data;
        } catch (error) {
            console.error('Subscription update error:', error);
            throw error;
        }
    }

    // Cancel subscription
    async cancelSubscription() {
        try {
            const token = this.getToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/subscription/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel subscription');
            }

            return data;
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    }

    // Get payment history
    async getPaymentHistory() {
        try {
            const token = this.getToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/subscription/payments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch payment history');
            }

            return data;
        } catch (error) {
            console.error('Error fetching payments:', error);
            throw error;
        }
    }

    // Get all available plans
    async getPlans() {
        try {
            const response = await fetch(`${API_URL}/subscription/plans`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch plans');
            }

            return data;
        } catch (error) {
            console.error('Error fetching plans:', error);
            throw error;
        }
    }
}

// Create and export a single instance
const subscriptionService = new SubscriptionService();
export default subscriptionService;