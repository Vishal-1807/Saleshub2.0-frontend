import { useState, useEffect, useCallback, useRef } from 'react';
import { addressLookupService, AddressLookupResult } from '../services/addressLookup.service';
import { PostcodeValidationState } from '../types';
import { debounce } from '../lib/formValidation';

export interface UsePostcodeValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
}

export interface UsePostcodeValidationReturn {
  validationState: PostcodeValidationState;
  validatePostcode: (postcode: string) => void;
  selectAddress: (address: string) => void;
  clearValidation: () => void;
  isValidPostcode: boolean;
  isAddressSelected: boolean;
  validationMessage: string | null;
}

/**
 * Custom hook for real-time postcode validation and address lookup
 */
export function usePostcodeValidation(
  options: UsePostcodeValidationOptions = {}
): UsePostcodeValidationReturn {
  const { debounceMs = 800, validateOnMount = false } = options;
  
  const [validationState, setValidationState] = useState<PostcodeValidationState>({
    isValid: false,
    isValidating: false,
    error: null,
    hasBeenValidated: false,
    addresses: [],
    selectedAddress: ''
  });

  const [lastValidatedPostcode, setLastValidatedPostcode] = useState<string>('');
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup function to cancel ongoing validations
  const cleanup = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    addressLookupService.cancelLookup();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Internal validation function
  const performValidation = useCallback(async (postcode: string) => {
    const cleanPostcode = addressLookupService.cleanPostcode(postcode);
    
    // Skip if same postcode was already validated
    if (cleanPostcode === lastValidatedPostcode && validationState.hasBeenValidated) {
      return;
    }

    // Check if postcode format is valid
    if (!addressLookupService.isValidPostcodeFormat(cleanPostcode)) {
      // Reset validation state if postcode format is invalid
      setValidationState({
        isValid: false,
        isValidating: false,
        error: null,
        hasBeenValidated: false,
        addresses: [],
        selectedAddress: ''
      });
      setLastValidatedPostcode('');
      return;
    }

    // Set validating state
    setValidationState(prev => ({
      ...prev,
      isValidating: true,
      error: null,
      selectedAddress: '' // Clear selected address when validating new postcode
    }));

    try {
      const result: AddressLookupResult = await addressLookupService.lookupAddresses(cleanPostcode);
      
      // Only update state if this is still the current validation
      setValidationState({
        isValid: result.isValid && result.addresses.length > 0,
        isValidating: false,
        error: result.error,
        hasBeenValidated: true,
        addresses: result.addresses,
        selectedAddress: ''
      });
      
      setLastValidatedPostcode(cleanPostcode);
    } catch (error) {
      // Handle any unexpected errors
      setValidationState({
        isValid: false,
        isValidating: false,
        error: 'Address lookup failed',
        hasBeenValidated: true,
        addresses: [],
        selectedAddress: ''
      });
    }
  }, [lastValidatedPostcode, validationState.hasBeenValidated]);

  // Debounced validation function
  const debouncedValidation = useCallback(
    debounce(performValidation, debounceMs),
    [performValidation, debounceMs]
  );

  // Public validation function
  const validatePostcode = useCallback((postcode: string) => {
    // Cancel any pending validation
    cleanup();
    
    // Trigger debounced validation
    debouncedValidation(postcode);
  }, [debouncedValidation, cleanup]);

  // Address selection function
  const selectAddress = useCallback((address: string) => {
    setValidationState(prev => ({
      ...prev,
      selectedAddress: address
    }));
  }, []);

  // Clear validation state
  const clearValidation = useCallback(() => {
    cleanup();
    setValidationState({
      isValid: false,
      isValidating: false,
      error: null,
      hasBeenValidated: false,
      addresses: [],
      selectedAddress: ''
    });
    setLastValidatedPostcode('');
  }, [cleanup]);

  // Derived values
  const isValidPostcode = validationState.isValid && validationState.hasBeenValidated;
  const isAddressSelected = isValidPostcode && validationState.selectedAddress !== '';
  const validationMessage = validationState.error || 
    (validationState.hasBeenValidated && !validationState.isValid ? 'Invalid postcode or no addresses found' : null);

  return {
    validationState,
    validatePostcode,
    selectAddress,
    clearValidation,
    isValidPostcode,
    isAddressSelected,
    validationMessage
  };
}
