'use client';

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary';
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'primary',
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) onCancel();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    const confirmBtnClass =
        variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white';

    return (
        <dialog
            ref={dialogRef}
            className="fixed inset-0 z-[100] bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full"
            onClick={(e) => {
                if (e.target === dialogRef.current) onCancel();
            }}
        >
            <div className="flex items-center justify-center min-h-full p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    {description && (
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                            {description}
                        </p>
                    )}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-5 py-2.5 rounded-lg font-semibold transition-colors text-sm disabled:opacity-50 ${confirmBtnClass}`}
                        >
                            {loading ? 'Processing...' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
}
