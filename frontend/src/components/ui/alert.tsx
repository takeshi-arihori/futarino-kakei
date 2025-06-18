import { ReactNode } from 'react';

interface AlertProps {
    children: ReactNode;
    variant?: 'default' | 'destructive';
    className?: string;
}

interface AlertDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function Alert({ children, variant = 'default', className = '' }: AlertProps) {
    const variantClasses = {
        default: 'border-border text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
    };

    return (
        <div
            className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variantClasses[variant]} ${className}`}
        >
            {children}
        </div>
    );
}

export function AlertDescription({ children, className = '' }: AlertDescriptionProps) {
    return (
        <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
            {children}
        </div>
    );
} 
