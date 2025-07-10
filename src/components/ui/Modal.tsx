'use client';

import { forwardRef, HTMLAttributes, useEffect } from 'react';
import { clsx } from 'clsx';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  children: React.ReactNode;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      isOpen,
      onClose,
      title,
      size = 'md',
      closeOnOverlayClick = true,
      children,
      ...props
    },
    ref
  ) => {
    // const modalRef = useRef<HTMLDivElement>(null); // Unused - using ref prop instead

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    };

    if (!isOpen) return null;

    return (
      <div
        className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50'
        onClick={handleOverlayClick}
      >
        <div
          ref={ref}
          className={clsx(
            'relative w-full bg-white rounded-lg shadow-xl',
            sizes[size],
            className
          )}
          role='dialog'
          aria-modal='true'
          aria-labelledby={title ? 'modal-title' : undefined}
          {...props}
        >
          {title && (
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2
                id='modal-title'
                className='text-lg font-semibold text-gray-900'
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600 transition-colors'
                aria-label='モーダルを閉じる'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          )}

          <div className='max-h-[calc(100vh-8rem)] overflow-y-auto'>
            {children}
          </div>
        </div>
      </div>
    );
  }
);

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('px-6 py-4 border-b border-gray-200', className)}
      {...props}
    >
      {children}
    </div>
  )
);

const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
);

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'px-6 py-4 border-t border-gray-200 bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Modal.displayName = 'Modal';
ModalHeader.displayName = 'ModalHeader';
ModalBody.displayName = 'ModalBody';
ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalHeader, ModalBody, ModalFooter };
export default Modal;
