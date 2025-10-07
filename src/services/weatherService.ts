import { API_CONFIG, API_KEYS } from '../config/apiKeys';
import { FEATURE_FLAGS } from '../config/featureFlags';

// Weather data interfaces
export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    current?: number;
  };
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex?: number;
}

export interface WeatherLocation {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface WeatherCacheEntry {
  data: WeatherForecast[];
  timestamp: number;
  location: WeatherLocation;
}

class WeatherService {
  private cache: Map<string, WeatherCacheEntry> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 50;

  /**
   * Get weather forecast for a specific location and date
   */
  async getWeatherForecast(
    location: WeatherLocation, 
    eventDate: Date
  ): Promise<WeatherForecast | null> {
    try {
      // Check if weather integration is enabled
      if (!FEATURE_FLAGS.WEATHER_INTEGRATION) {
        console.log('Weather integration is disabled');
        return null;
      }

      // Check if event is too far in the future (OpenWeather provides 5-day forecasts)
      const today = new Date();
      const daysDifference = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference > 5) {
        console.log(`Event is ${daysDifference} days away - forecast not available yet`);
        return null;
      }

      if (daysDifference < 0) {
        console.log('Event date is in the past');
        return null;
      }

      // Get API key
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        console.warn('OpenWeather API key not available');
        return null;
      }

      // Get forecast data (with caching)
      const forecasts = await this.getCachedForecast(location, apiKey);
      if (!forecasts || forecasts.length === 0) {
        return null;
      }

      // Find the forecast for the event date
      const eventDateStr = eventDate.toISOString().split('T')[0];
      const eventForecast = forecasts.find(forecast => 
        forecast.date === eventDateStr
      );

      return eventForecast || null;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return null;
    }
  }

  /**
   * Get cached forecast data or fetch from API
   */
  private async getCachedForecast(
    location: WeatherLocation, 
    apiKey: string
  ): Promise<WeatherForecast[]> {
    const cacheKey = this.getCacheKey(location);
    const cached = this.cache.get(cacheKey);

    // Check if cache is valid
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    // Fetch new data
    const forecastData = await this.fetchForecastFromAPI(location, apiKey);
    
    // Update cache
    this.updateCache(cacheKey, {
      data: forecastData,
      timestamp: Date.now(),
      location
    });

    return forecastData;
  }

  /**
   * Fetch forecast data from OpenWeather API
   */
  private async fetchForecastFromAPI(
    location: WeatherLocation, 
    apiKey: string
  ): Promise<WeatherForecast[]> {
    const { lat, lng } = location.coordinates;
    
    const response = await fetch(
      `${API_CONFIG.ADMIN.OPENWEATHER.baseUrl}${API_CONFIG.ADMIN.OPENWEATHER.forecastEndpoint}?lat=${lat}&lon=${lng}&appid=${apiKey}&units=imperial`
    );

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }

    const data = await response.json();
    return this.parseForecastData(data);
  }

  /**
   * Parse OpenWeather API response into our format
   */
  private parseForecastData(apiData: any): WeatherForecast[] {
    if (!apiData.list || !Array.isArray(apiData.list)) {
      return [];
    }

    // Group forecasts by date
    const dailyForecasts = new Map<string, any[]>();
    
    apiData.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, []);
      }
      dailyForecasts.get(date)!.push(item);
    });

    // Convert to our format
    const forecasts: WeatherForecast[] = [];
    
    dailyForecasts.forEach((dayItems, date) => {
      if (dayItems.length === 0) return;

      // Calculate min/max temperatures
      const temperatures = dayItems.map(item => item.main.temp);
      const minTemp = Math.min(...temperatures);
      const maxTemp = Math.max(...temperatures);

      // Use midday forecast for description and icon
      const middayItem = dayItems.find(item => 
        item.dt_txt.includes('12:00:00')
      ) || dayItems[Math.floor(dayItems.length / 2)];

      // Calculate average values
      const avgHumidity = dayItems.reduce((sum, item) => sum + item.main.humidity, 0) / dayItems.length;
      const avgWindSpeed = dayItems.reduce((sum, item) => sum + item.wind.speed, 0) / dayItems.length;
      const totalPrecipitation = dayItems.reduce((sum, item) => 
        sum + (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0), 0
      );

      forecasts.push({
        date,
        temperature: {
          min: Math.round(minTemp),
          max: Math.round(maxTemp),
          current: Math.round(middayItem.main.temp)
        },
        description: middayItem.weather[0].description,
        icon: middayItem.weather[0].icon,
        humidity: Math.round(avgHumidity),
        windSpeed: Math.round(avgWindSpeed * 10) / 10,
        precipitation: Math.round(totalPrecipitation * 10) / 10,
        uvIndex: middayItem.uvi
      });
    });

    return forecasts;
  }

  /**
   * Get API key for weather requests
   */
  private async getApiKey(): Promise<string | null> {
    try {
      const apiKeys = await import('../config/apiKeys');
      return apiKeys.API_KEYS.ADMIN?.OPENWEATHER || null;
    } catch (error) {
      console.error('Error getting API keys:', error);
      return null;
    }
  }

  /**
   * Generate cache key for location
   */
  private getCacheKey(location: WeatherLocation): string {
    const { lat, lng } = location.coordinates;
    return `${lat.toFixed(2)},${lng.toFixed(2)}`;
  }

  /**
   * Update cache with new data
   */
  private updateCache(key: string, entry: WeatherCacheEntry): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, entry);
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get weather icon URL
   */
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  /**
   * Get weather condition emoji
   */
  getWeatherEmoji(iconCode: string): string {
    const emojiMap: Record<string, string> = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // snow
      '13n': '❄️',
      '50d': '🌫️', // mist
      '50n': '🌫️'
    };

    return emojiMap[iconCode] || '🌤️';
  }

  /**
   * Get weather condition color class
   */
  getWeatherColorClass(iconCode: string): string {
    if (iconCode.startsWith('01')) return 'text-yellow-500'; // clear
    if (iconCode.startsWith('02') || iconCode.startsWith('03')) return 'text-gray-500'; // clouds
    if (iconCode.startsWith('09') || iconCode.startsWith('10')) return 'text-blue-500'; // rain
    if (iconCode.startsWith('11')) return 'text-purple-500'; // thunderstorm
    if (iconCode.startsWith('13')) return 'text-blue-300'; // snow
    if (iconCode.startsWith('50')) return 'text-gray-400'; // mist
    return 'text-gray-500';
  }

  /**
   * Check if weather forecast will be available for an event date
   */
  willForecastBeAvailable(eventDate: Date): { available: boolean; daysUntilAvailable?: number; reason?: string } {
    const today = new Date();
    const daysDifference = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference < 0) {
      return { available: false, reason: 'Event has passed' };
    }
    
    if (daysDifference > 5) {
      return { 
        available: false, 
        daysUntilAvailable: daysDifference - 5,
        reason: `Forecast available ${daysDifference - 5} days before event`
      };
    }
    
    return { available: true };
  }
}

export const weatherService = new WeatherService();
export default weatherService;
