export interface HLRValidationResponse {
  status: 'Valid' | 'Invalid' | 'Unknown';
  message?: string;
  network?: string;
  country?: string;
}

export interface HLRValidationResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  response: HLRValidationResponse | null;
}

class HLRService {
  private readonly baseUrl: string;
  private readonly hlrKey: string;
  private abortController: AbortController | null = null;

  constructor() {
    // Get HLR_KEY from environment variables
    this.hlrKey = import.meta.env.VITE_HLR_KEY || '95465b2578878c8898b8ce910801a712';

    // Use proxy endpoint in development, direct API in production
    this.baseUrl = import.meta.env.DEV
      ? '/api/hlr'  // This will be proxied by Vite
      : 'https://interactive.leadbyte.co.uk/restapi/v1.2/validate/mobile';
  }

  /**
   * Mock validation for testing when API is not available
   */
  private mockValidation(phoneNumber: string): HLRValidationResult {
    // Simple mock logic: numbers starting with 07480 are valid, others are invalid
    const isValid = phoneNumber.startsWith('07480');

    return {
      isValid,
      isLoading: false,
      error: null,
      response: {
        status: isValid ? 'Valid' : 'Invalid',
        message: isValid ? 'Valid mobile number' : 'Invalid mobile number',
        network: isValid ? 'EE' : undefined,
        country: 'UK'
      }
    };
  }

  /**
   * Validates a UK phone number using HLR API
   * @param phoneNumber - 11-digit UK mobile number (07 followed by 9 digits)
   * @returns Promise with validation result
   */
  async validatePhoneNumber(phoneNumber: string): Promise<HLRValidationResult> {
    // Cancel any previous request
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller for this request
    this.abortController = new AbortController();

    try {
      // Validate input format
      if (!this.isValidPhoneFormat(phoneNumber)) {
        return {
          isValid: false,
          isLoading: false,
          error: 'Phone number must be 11 digits starting with 07',
          response: null
        };
      }

      // Check if mock mode is enabled
      if (import.meta.env.VITE_HLR_MOCK_MODE === 'true') {
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.mockValidation(phoneNumber);
      }

      // Use the 11-digit UK number directly (no country code prefix needed)
      const fullPhoneNumber = phoneNumber;

      // Construct API URL
      const url = `${this.baseUrl}?value=${fullPhoneNumber}&key=${this.hlrKey}`;

      console.log('HLR API Request:', { url: this.baseUrl, phoneNumber: fullPhoneNumber });

      // Make API request
      const response = await fetch(url, {
        method: 'GET',
        signal: this.abortController.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('HLR API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse response
      const hlrResponse: HLRValidationResponse = {
        status: data.status || 'Unknown',
        message: data.message,
        network: data.network,
        country: data.country
      };

      return {
        isValid: hlrResponse.status === 'Valid',
        isLoading: false,
        error: null,
        response: hlrResponse
      };

    } catch (error) {
      // Handle abort signal (user stopped typing)
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          isValid: false,
          isLoading: false,
          error: null,
          response: null
        };
      }

      // Handle specific error types
      let errorMessage = 'Validation failed';
      let shouldUseMock = false;

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
          errorMessage = 'Using mock validation (API unavailable)';
          shouldUseMock = true;
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Using mock validation (Network error)';
          shouldUseMock = true;
        } else {
          errorMessage = error.message;
        }
      }

      console.warn('HLR Validation Error, falling back to mock:', error);

      // Use mock validation as fallback
      if (shouldUseMock) {
        const mockResult = this.mockValidation(phoneNumber);
        return {
          ...mockResult,
          error: errorMessage // Keep the original error message for user info
        };
      }

      return {
        isValid: false,
        isLoading: false,
        error: errorMessage,
        response: null
      };
    }
  }

  /**
   * Validates phone number format (11 digits starting with 07)
   * @param phoneNumber - Phone number to validate
   * @returns boolean indicating if format is valid
   */
  private isValidPhoneFormat(phoneNumber: string): boolean {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return cleanNumber.length === 11 && /^07\d{9}$/.test(cleanNumber);
  }

  /**
   * Cleans phone number by removing non-digit characters
   * @param phoneNumber - Raw phone number input
   * @returns Cleaned phone number with only digits
   */
  cleanPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  /**
   * Cancels any ongoing validation request
   */
  cancelValidation(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export const hlrService = new HLRService();
