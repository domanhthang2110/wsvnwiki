import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

export const Toast = ({ toast, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 3000);

        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const bgColors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    return (
        <div className={`${bgColors[toast.type]} text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-300`}>
            <span>{toast.message}</span>
            <button onClick={() => onClose(toast.id)} className="ml-2 hover:text-gray-200">
                ×
            </button>
        </div>
    );
};

export const ToastContainer = ({ toasts, onClose }: { toasts: ToastMessage[], onClose: (id: string) => void }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};
