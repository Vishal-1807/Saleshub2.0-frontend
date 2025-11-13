import { useState, useEffect, useCallback, useRef } from 'react';
import { hlrService, HLRValidationResult } from '../services/hlr.service';
import { 
  ValidationState, 
  debounce, 
  shouldTriggerPhoneValidation 
} from '../lib/formValidation';

export interface UsePhoneValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
}

export interface UsePhoneValidationReturn {
  validationState: ValidationState;
  validatePhone: (phoneNumber: string) => void;
  clearValidation: () => void;
  isValidPhone: boolean;
  validationMessage: string | null;
}

/**
 * Custom hook for real-time phone number validation using HLR API
 */
export function usePhoneValidation(
  options: UsePhoneValidationOptions = {}
): UsePhoneValidationReturn {
  const { debounceMs = 500, validateOnMount = false } = options;
  
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    isValidating: false,
    error: null,
    hasBeenValidated: false
  });

  const [lastValidatedNumber, setLastValidatedNumber] = useState<string>('');
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup function to cancel ongoing validations
  const cleanup = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    hlrService.cancelValidation();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Internal validation function
  const performValidation = useCallback(async (phoneNumber: string) => {
    const cleanNumber = hlrService.cleanPhoneNumber(phoneNumber);
    
    // Skip if same number was already validated
    if (cleanNumber === lastValidatedNumber && validationState.hasBeenValidated) {
      return;
    }

    // Check if we should trigger validation (11 digits starting with 07)
    if (!shouldTriggerPhoneValidation(cleanNumber)) {
      // Reset validation state if number is not in UK mobile format
      setValidationState({
        isValid: false,
        isValidating: false,
        error: null,
        hasBeenValidated: false
      });
      setLastValidatedNumber('');
      return;
    }

    // Set validating state
    setValidationState(prev => ({
      ...prev,
      isValidating: true,
      error: null
    }));

    try {
      const result: HLRValidationResult = await hlrService.validatePhoneNumber(cleanNumber);
      
      // Only update state if this is still the current validation
      setValidationState({
        isValid: result.isValid,
        isValidating: false,
        error: result.error,
        hasBeenValidated: true
      });
      
      setLastValidatedNumber(cleanNumber);
    } catch (error) {
      // Handle any unexpected errors
      setValidationState({
        isValid: false,
        isValidating: false,
        error: 'Validation failed',
        hasBeenValidated: true
      });
    }
  }, [lastValidatedNumber, validationState.hasBeenValidated]);

  // Debounced validation function
  const debouncedValidation = useCallback(
    debounce(performValidation, debounceMs),
    [performValidation, debounceMs]
  );

  // Public validation function
  const validatePhone = useCallback((phoneNumber: string) => {
    // Cancel any pending validation
    cleanup();
    
    // Trigger debounced validation
    debouncedValidation(phoneNumber);
  }, [debouncedValidation, cleanup]);

  // Clear validation state
  const clearValidation = useCallback(() => {
    cleanup();
    setValidationState({
      isValid: false,
      isValidating: false,
      error: null,
      hasBeenValidated: false
    });
    setLastValidatedNumber('');
  }, [cleanup]);

  // Derived values
  const isValidPhone = validationState.isValid && validationState.hasBeenValidated;
  const validationMessage = validationState.error || 
    (validationState.hasBeenValidated && !validationState.isValid ? 'Not Valid' : null);

  return {
    validationState,
    validatePhone,
    clearValidation,
    isValidPhone,
    validationMessage
  };
}
