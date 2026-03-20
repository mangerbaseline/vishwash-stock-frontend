import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, Mail, MailCheck, MailWarning, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'email_sent' | 'email_failed';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'email_sent':
                return <MailCheck className="w-5 h-5 text-green-500" />;
            case 'email_failed':
                return <MailWarning className="w-5 h-5 text-red-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
            case 'email_sent':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'error':
            case 'email_failed':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
            case 'email_sent':
                return 'text-green-800 dark:text-green-200';
            case 'error':
            case 'email_failed':
                return 'text-red-800 dark:text-red-200';
            case 'warning':
                return 'text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'text-blue-800 dark:text-blue-200';
            default:
                return 'text-blue-800 dark:text-blue-200';
        }
    };

    return (
        <div
            className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
        >
            <div className={`
        relative rounded-xl border p-4 shadow-lg backdrop-blur-sm
        ${getBgColor()}
      `}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className={`flex-1 text-sm ${getTextColor()}`}>
                        {message}
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress bar */}
                <div
                    className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-xl"
                    style={{
                        width: isVisible ? '100%' : '0%',
                        transition: `width ${duration}ms linear`,
                    }}
                />
            </div>
        </div>
    );
};

// Toast Container Component
interface ToastContainerProps {
    toasts: Array<{
        id: string;
        message: string;
        type: ToastType;
    }>;
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    return (
        <>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onClose(toast.id)}
                />
            ))}
        </>
    );
};

// Custom hook for toast management
export const useToast = () => {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

    const addToast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast  = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return { toasts, addToast, removeToast };
};