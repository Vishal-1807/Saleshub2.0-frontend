import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ValidationState } from '../lib/formValidation';

export interface PhoneValidationIndicatorProps {
  validationState: ValidationState;
  className?: string;
}

/**
 * Component that displays phone validation status with appropriate icons and messages
 */
export function PhoneValidationIndicator({ 
  validationState, 
  className = '' 
}: PhoneValidationIndicatorProps) {
  const { isValid, isValidating, error, hasBeenValidated } = validationState;

  // Don't show anything if validation hasn't been attempted
  if (!hasBeenValidated && !isValidating) {
    return null;
  }

  // Show loading state
  if (isValidating) {
    return (
      <div className={`flex items-center gap-2 text-blue-600 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Validating...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <XCircle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  // Show validation result
  if (hasBeenValidated) {
    if (isValid) {
      return (
        <div className={`flex items-center gap-2 text-green-600 ${className}`}>
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Valid</span>
        </div>
      );
    } else {
      return (
        <div className={`flex items-center gap-2 text-red-600 ${className}`}>
          <XCircle className="w-4 h-4" />
          <span className="text-sm">Not Valid</span>
        </div>
      );
    }
  }

  return null;
}

/**
 * Inline validation icon that appears next to the input field
 */
export function PhoneValidationIcon({ validationState }: { validationState: ValidationState }) {
  const { isValid, isValidating, hasBeenValidated } = validationState;

  if (isValidating) {
    return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
  }

  if (hasBeenValidated && isValid) {
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  }

  if (hasBeenValidated && !isValid) {
    return <XCircle className="w-5 h-5 text-red-600" />;
  }

  return null;
}

/**
 * Enhanced phone input component with built-in validation
 */
export interface ValidatedPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function ValidatedPhoneInput({
  value,
  onChange,
  onValidationChange,
  disabled = false,
  className = '',
  placeholder = 'Enter phone number',
  required = false
}: ValidatedPhoneInputProps) {
  // This would use the usePhoneValidation hook
  // For now, we'll create a basic structure that can be enhanced
  
  const baseInputClasses = `
    w-full px-4 py-2 pr-12 border rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    transition-all
  `;
  
  const inputClasses = `
    ${baseInputClasses}
    ${disabled ? 'bg-slate-100 cursor-not-allowed border-slate-300' : 'border-slate-300'}
    ${className}
  `;

  return (
    <div className="relative">
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={inputClasses}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {/* Validation icon would go here */}
      </div>
    </div>
  );
}
