// Firebase Functions Secret Manager Service
// This service handles secure API key retrieval from Google Secret Manager

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as functions from 'firebase-functions';

export interface SecretConfig {
  name: string;
  required: boolean;
  fallback?: string;
  description?: string;
}

export interface SecretResult {
  value: string;
  source: 'secret-manager' | 'fallback' | 'missing';
  error?: string;
}

class SecretManagerService {
  private client: SecretManagerServiceClient;
  private projectId: string;
  private cache: Map<string, { value: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'pack-1703-portal';
    functions.logger.info('🔐 Secret Manager Service initialized');
  }

  /**
   * Get a secret from Google Secret Manager
   */
  async getSecret(secretName: string, config: SecretConfig): Promise<SecretResult> {
    try {
      // Check cache first
      const cached = this.cache.get(secretName);
      if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        functions.logger.info(`🔑 Using cached secret: ${secretName}`);
        return { value: cached.value, source: 'secret-manager' };
      }

      // Get secret from Secret Manager
      const [version] = await this.client.accessSecretVersion({
        name: `projects/${this.projectId}/secrets/${secretName}/versions/latest`,
      });

      const secretValue = version.payload?.data?.toString();
      
      if (!secretValue) {
        throw new Error(`Secret ${secretName} is empty`);
      }

      // Cache the secret
      this.cache.set(secretName, {
        value: secretValue,
        timestamp: Date.now()
      });

      functions.logger.info(`🔑 Retrieved secret: ${secretName}`);
      return { value: secretValue, source: 'secret-manager' };

    } catch (error) {
      functions.logger.error(`❌ Failed to get secret ${secretName}:`, error);

      // Use fallback if provided
      if (config.fallback) {
        functions.logger.warn(`⚠️ Using fallback for ${secretName}`);
        return { value: config.fallback, source: 'fallback' };
      }

      // Throw error if required and not found
      if (config.required) {
        const errorMsg = `❌ SECURITY ERROR: ${secretName} is required but not found in Secret Manager!`;
        functions.logger.error(errorMsg);
        throw new Error(`${secretName} is required but not configured`);
      }

      return { 
        value: '', 
        source: 'missing', 
        error: `Secret ${secretName} not found and no fallback provided` 
      };
    }
  }

  /**
   * Get multiple secrets at once
   */
  async getSecrets(secrets: Record<string, SecretConfig>): Promise<Record<string, SecretResult>> {
    const results: Record<string, SecretResult> = {};
    
    // Get all secrets in parallel
    const promises = Object.entries(secrets).map(async ([key, config]) => {
      const result = await this.getSecret(key, config);
      results[key] = result;
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Get all API keys for the application
   */
  async getAllApiKeys(): Promise<Record<string, any>> {
    const secretConfigs: Record<string, SecretConfig> = {
      // Admin Keys
      'admin-google-maps-key': {
        name: 'admin-google-maps-key',
        required: true,
        description: 'Admin Google Maps API key'
      },
      'admin-openweather-key': {
        name: 'admin-openweather-key',
        required: true,
        description: 'Admin OpenWeather API key'
      },
      'admin-google-places-key': {
        name: 'admin-google-places-key',
        required: true,
        description: 'Admin Google Places API key'
      },
      
      // User Keys
      'user-google-maps-key': {
        name: 'user-google-maps-key',
        required: true,
        description: 'User Google Maps API key'
      },
      'user-openweather-key': {
        name: 'user-openweather-key',
        required: true,
        description: 'User OpenWeather API key'
      },
      'user-google-places-key': {
        name: 'user-google-places-key',
        required: true,
        description: 'User Google Places API key'
      },
      
      // Shared Keys
      'phone-validation-key': {
        name: 'phone-validation-key',
        required: true,
        description: 'Phone validation API key'
      },
      'tenor-key': {
        name: 'tenor-key',
        required: true,
        description: 'Tenor GIF API key'
      },
      'recaptcha-v3-site-key': {
        name: 'recaptcha-v3-site-key',
        required: true,
        description: 'reCAPTCHA v3 Site Key'
      },
      'recaptcha-v3-secret-key': {
        name: 'recaptcha-v3-secret-key',
        required: true,
        description: 'reCAPTCHA v3 Secret Key'
      }
    };

    const results = await this.getSecrets(secretConfigs);
    
    // Organize results into the expected structure
    const apiKeys: Record<string, any> = {
      ADMIN: {
        GOOGLE_MAPS: results['admin-google-maps-key'].value,
        OPENWEATHER: results['admin-openweather-key'].value,
        GOOGLE_PLACES: results['admin-google-places-key'].value,
      },
      USER: {
        GOOGLE_MAPS: results['user-google-maps-key'].value,
        OPENWEATHER: results['user-openweather-key'].value,
        GOOGLE_PLACES: results['user-google-places-key'].value,
      },
      PHONE_VALIDATION: results['phone-validation-key'].value,
      TENOR: results['tenor-key'].value,
      RECAPTCHA: {
        SITE_KEY: results['recaptcha-v3-site-key'].value,
        SECRET_KEY: results['recaptcha-v3-secret-key'].value,
      }
    };

    // Log which secrets were successfully retrieved
    const successfulSecrets = Object.entries(results)
      .filter(([_, result]) => result.source === 'secret-manager')
      .map(([key, _]) => key);
    
    functions.logger.info(`✅ Successfully loaded ${successfulSecrets.length} secrets from Secret Manager:`, successfulSecrets);

    return apiKeys;
  }

  /**
   * Clear the secret cache
   */
  clearCache(): void {
    this.cache.clear();
    functions.logger.info('🧹 Secret cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const secretManagerService = new SecretManagerService();

// Export types
export { SecretManagerService };
export type { SecretConfig as SecretManagerConfig, SecretResult as SecretManagerResult };
