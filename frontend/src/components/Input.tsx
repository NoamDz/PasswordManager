import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Input({ label, className = '', ...rest }: InputProps) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      <input
        className={`mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 shadow-md focus:border-primary focus:ring-primary sm:text-sm ${className}`}
        {...rest}
      />
    </label>
  );
} 