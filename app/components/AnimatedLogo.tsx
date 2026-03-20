'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AnimatedLogo() {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push('/dashboard/stock-dashboard')}
            className="flex items-center gap-3 cursor-pointer relative z-50"
        >
            {/* Animated Logo Icon - pointer-events-none so clicks pass through */}
            <motion.div
                className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg pointer-events-none"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
                <BarChart3 className="w-5 h-5 text-white pointer-events-none" />
            </motion.div>

            {/* Animated Text - pointer-events-none so clicks pass through */}
            <div className="flex flex-col pointer-events-none">
                <motion.h1
                    className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-wide"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                >
                    MetricOrbit
                </motion.h1>
                <motion.p
                    className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Analytics Dashboard
                </motion.p>
            </div>
        </div>
    );
}