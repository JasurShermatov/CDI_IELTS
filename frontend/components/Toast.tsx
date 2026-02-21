'use client';

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react';

/* ─── Types ────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    duration: number;
}

interface ToastContextValue {
    toast: {
        success: (message: string, duration?: number) => void;
        error: (message: string, duration?: number) => void;
        warning: (message: string, duration?: number) => void;
        info: (message: string, duration?: number) => void;
    };
}

/* ─── Context ──────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

/* ─── Icons ────────────────────────────────────────── */
const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
};

const bgColors: Record<ToastType, string> = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    warning: 'bg-amber-500',
    info: 'bg-blue-600',
};

/* ─── Single Toast ─────────────────────────────────── */
function ToastMessage({
    item,
    onRemove,
}: {
    item: ToastItem;
    onRemove: (id: string) => void;
}) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const exitTimer = setTimeout(() => setExiting(true), item.duration - 300);
        const removeTimer = setTimeout(() => onRemove(item.id), item.duration);
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [item, onRemove]);

    return (
        <div
            role="alert"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium
        ${bgColors[item.type]}
        ${exiting ? 'animate-slide-out' : 'animate-slide-in'}
      `}
        >
            <span className="text-lg leading-none">{icons[item.type]}</span>
            <span className="flex-1">{item.message}</span>
            <button
                onClick={() => onRemove(item.id)}
                className="opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}

/* ─── Provider ─────────────────────────────────────── */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const remove = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    }, []);

    const toast = {
        success: (msg: string, d?: number) => push('success', msg, d),
        error: (msg: string, d?: number) => push('error', msg, d),
        warning: (msg: string, d?: number) => push('warning', msg, d),
        info: (msg: string, d?: number) => push('info', msg, d),
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            {/* Toast container — fixed bottom-right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastMessage item={t} onRemove={remove} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue['toast'] {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return ctx.toast;
}
