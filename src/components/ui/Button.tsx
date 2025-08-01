import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-md',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && 'cursor-not-allowed',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className='animate-spin -ml-1 mr-2 h-4 w-4'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            読み込み中...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
