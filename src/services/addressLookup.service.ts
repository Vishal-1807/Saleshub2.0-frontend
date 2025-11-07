import { AddressLookupResponse, AddressLookupResult } from '../types';

class AddressLookupService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private abortController: AbortController | null = null;

  constructor() {
    // Get ADDRESS_LOOKUP_KEY from environment variables
    this.apiKey = import.meta.env.VITE_ADDRESS_LOOKUP_KEY || 'zcTCpi-bAEOcT_bGuVagNw4049';
    this.baseUrl = 'https://api.getAddress.io/v2/uk';
  }

  /**
   * Validates UK postcode format using the specified regex pattern
   * @param postcode - Postcode to validate
   * @returns boolean indicating if format is valid
   */
  isValidPostcodeFormat(postcode: string): boolean {
    const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
    return postcodeRegex.test(postcode.trim());
  }

  /**
   * Cleans postcode by removing extra spaces and converting to uppercase
   * @param postcode - Raw postcode input
   * @returns Cleaned postcode
   */
  cleanPostcode(postcode: string): string {
    return postcode.trim().toUpperCase().replace(/\s+/g, ' ');
  }

  /**
   * Mock address lookup for testing when API is not available
   */
  private mockAddressLookup(postcode: string): AddressLookupResult {
    // Simple mock logic: provide sample addresses for valid postcodes
    const mockAddresses = [
      '123 High Street, London',
      '456 Oak Avenue, London', 
      '789 Park Road, London',
      '321 Church Lane, London'
    ];

    const mockResponse: AddressLookupResponse = {
      Latitude: 51.5074,
      Longitude: -0.1278,
      Addresses: mockAddresses
    };

    return {
      isValid: true,
      isLoading: false,
      error: null,
      addresses: mockAddresses,
      response: mockResponse
    };
  }

  /**
   * Looks up addresses for a UK postcode using getAddress.io API
   * @param postcode - UK postcode to lookup
   * @returns Promise with address lookup result
   */
  async lookupAddresses(postcode: string): Promise<AddressLookupResult> {
    // Cancel any previous request
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller for this request
    this.abortController = new AbortController();

    try {
      // Validate postcode format
      const cleanedPostcode = this.cleanPostcode(postcode);
      if (!this.isValidPostcodeFormat(cleanedPostcode)) {
        return {
          isValid: false,
          isLoading: false,
          error: 'Invalid UK postcode format',
          addresses: [],
          response: null
        };
      }

      // Check if mock mode is enabled
      if (import.meta.env.VITE_ADDRESS_LOOKUP_MOCK_MODE === 'true') {
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        return this.mockAddressLookup(cleanedPostcode);
      }

      // Construct API URL - encode postcode for URL safety
      const encodedPostcode = encodeURIComponent(cleanedPostcode);
      const url = `${this.baseUrl}/${encodedPostcode}?api-key=${this.apiKey}`;

      console.log('Address Lookup API Request:', { url: this.baseUrl, postcode: cleanedPostcode });

      // Make API request
      const response = await fetch(url, {
        method: 'GET',
        signal: this.abortController.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Address Lookup API Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          return {
            isValid: false,
            isLoading: false,
            error: 'Postcode not found',
            addresses: [],
            response: null
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AddressLookupResponse = await response.json();
      
      // Validate response structure
      if (!data.Addresses || !Array.isArray(data.Addresses)) {
        throw new Error('Invalid API response format');
      }

      return {
        isValid: true,
        isLoading: false,
        error: null,
        addresses: data.Addresses,
        response: data
      };

    } catch (error) {
      // Handle abort signal (user stopped typing)
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          isValid: false,
          isLoading: false,
          error: null,
          addresses: [],
          response: null
        };
      }

      // Handle specific error types
      let errorMessage = 'Address lookup failed';
      let shouldUseMock = false;

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
          errorMessage = 'Using mock addresses (API unavailable)';
          shouldUseMock = true;
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Using mock addresses (Network error)';
          shouldUseMock = true;
        } else {
          errorMessage = error.message;
        }
      }

      console.warn('Address Lookup Error, falling back to mock:', error);

      // Use mock lookup as fallback
      if (shouldUseMock) {
        const mockResult = this.mockAddressLookup(postcode);
        return {
          ...mockResult,
          error: errorMessage // Keep the original error message for user info
        };
      }

      return {
        isValid: false,
        isLoading: false,
        error: errorMessage,
        addresses: [],
        response: null
      };
    }
  }

  /**
   * Cancels any ongoing address lookup request
   */
  cancelLookup(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export const addressLookupService = new AddressLookupService();
