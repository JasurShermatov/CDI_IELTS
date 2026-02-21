import Link from 'next/link';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export default function EmptyState({
    icon = '📭',
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <span className="text-5xl mb-4" role="img" aria-hidden="true">
                {icon}
            </span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
            {description && (
                <p className="text-gray-500 max-w-md mb-6">{description}</p>
            )}
            {actionLabel && actionHref && (
                <Link href={actionHref} className="btn-primary">
                    {actionLabel}
                </Link>
            )}
            {actionLabel && onAction && !actionHref && (
                <button onClick={onAction} className="btn-primary">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
