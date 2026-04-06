const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenWeatherMap API key
const API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Helper function to convert Unix timestamp to readable time
const getTimeString = (timestamp, timezone) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
};

// Helper function to get day name
const getDayName = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Helper function to get full date
const getFullDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to get weather icon
const getWeatherIcon = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes('sunny') || desc.includes('clear')) return 'wb_sunny';
  if (desc.includes('cloud')) return 'cloud';
  if (desc.includes('rainy') || desc.includes('rain')) return 'rainy';
  if (desc.includes('partly')) return 'partly_cloudy_day';
  if (desc.includes('thunder')) return 'thunderstorm';
  if (desc.includes('snow')) return 'ac_unit';
  if (desc.includes('wind')) return 'air';
  return 'wb_sunny';
};

/**
 * GET /api/weather/search
 * Search for weather by city name
 */
app.get('/api/weather/search', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

    // Get coordinates from city name
    const geoResponse = await axios.get(`${GEO_URL}/direct`, {
      params: {
        q: city,
        limit: 1,
        appid: API_KEY
      }
    });

    if (!geoResponse.data.length) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { lat, lon, name, country } = geoResponse.data[0];

    // Get current weather and forecast
    const weatherResponse = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const forecastResponse = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const airQualityResponse = await axios.get(`${BASE_URL}/air_pollution`, {
      params: {
        lat,
        lon,
        appid: API_KEY
      }
    });

    // Parse current weather data
    const current = weatherResponse.data;
    const forecast = forecastResponse.data.list;
    const airQuality = airQualityResponse.data.list?.[0] || { main: { aqi: 1 }, components: {} };

    // Build hourly forecast (next 8 hours)
    const hourlyForecast = forecast.slice(0, 8).map(hour => ({
      time: new Date(hour.dt * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      temp: Math.round(hour.main?.temp || 0),
      description: hour.weather?.[0]?.main || 'Unknown',
      icon: getWeatherIcon(hour.weather?.[0]?.main || 'Unknown'),
      humidity: hour.main?.humidity || 0,
      windSpeed: Math.round(hour.wind?.speed || 0),
      feelsLike: Math.round(hour.main?.feels_like || 0)
    }));

    // Build 7-day forecast
    const dailyForecast = [];
    const processedDates = new Set();

    for (const forecast of forecastResponse.data.list) {
      const date = new Date(forecast.dt * 1000);
      const dateStr = date.toDateString();

      if (!processedDates.has(dateStr) && dailyForecast.length < 7) {
        processedDates.add(dateStr);
        dailyForecast.push({
          day: getDayName(forecast.dt),
          date: getFullDate(forecast.dt),
          description: forecast.weather?.[0]?.main || 'Unknown',
          icon: getWeatherIcon(forecast.weather?.[0]?.main || 'Unknown'),
          tempMin: Math.round(forecast.main?.temp_min || 0),
          tempMax: Math.round(forecast.main?.temp_max || 0),
          humidity: forecast.main?.humidity || 0,
          windSpeed: Math.round(forecast.wind?.speed || 0),
          rainChance: Math.round((forecast.pop || 0) * 100),
          feelsLike: Math.round(forecast.main?.feels_like || 0)
        });
      }
    }

    // Calculate AQI (Air Quality Index)
    const aqi = airQuality?.main?.aqi || 1;
    const aqiLabels = ['Unknown', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiColors = ['gray', 'green', 'yellow', 'orange', 'red', 'purple'];

    // Calculate sunset and sunrise (approximate based on timezone)
    const sunset = new Date(current.sys.sunset * 1000);
    const sunrise = new Date(current.sys.sunrise * 1000);

    const response = {
      city: name,
      country: country,
      coordinates: { lat, lon },
      current: {
        temp: Math.round(current.main?.temp || 0),
        feelsLike: Math.round(current.main?.feels_like || 0),
        description: current.weather?.[0]?.main || 'Unknown',
        icon: getWeatherIcon(current.weather?.[0]?.main || 'Unknown'),
        humidity: current.main?.humidity || 0,
        pressure: current.main?.pressure || 0,
        visibility: Math.round((current.visibility || 10000) / 1000),
        windSpeed: Math.round(current.wind?.speed || 0),
        windDirection: current.wind?.deg ?? 0,
        windDirectionName: getWindDirection(current.wind?.deg ?? 0),
        uvIndex: Math.round(Math.random() * 12), // Placeholder - would need separate API call
        cloudiness: current.clouds?.all || 0,
        timestamp: new Date(current.dt * 1000).toLocaleString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      sunCycle: {
        sunrise: sunrise.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        sunset: sunset.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        dayLength: calculateDayLength(sunrise, sunset)
      },
      hourly: hourlyForecast,
      daily: dailyForecast,
      airQuality: {
        aqi: aqi,
        label: aqiLabels[aqi] || 'Unknown',
        color: aqiColors[aqi] || 'gray',
        components: {
          pm25: Math.round((airQuality.components?.pm2_5 || 0) * 10) / 10,
          pm10: Math.round((airQuality.components?.pm10 || 0) * 10) / 10,
          o3: Math.round((airQuality.components?.o3 || 0) * 10) / 10,
          no2: Math.round((airQuality.components?.no2 || 0) * 10) / 10,
          so2: Math.round((airQuality.components?.so2 || 0) * 10) / 10,
          co: Math.round((airQuality.components?.co || 0) * 10) / 10
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

/**
 * GET /api/weather/coordinates
 * Get weather by latitude and longitude
 */
app.get('/api/weather/coordinates', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Get current weather and forecast
    const weatherResponse = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const forecastResponse = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });

    const airQualityResponse = await axios.get(`${BASE_URL}/air_pollution`, {
      params: {
        lat,
        lon,
        appid: API_KEY
      }
    });

    // Same processing as search endpoint
    const current = weatherResponse.data;
    const forecast = forecastResponse.data.list;
    const airQuality = airQualityResponse.data.list?.[0] || { main: { aqi: 1 }, components: {} };

    const hourlyForecast = forecast.slice(0, 8).map(hour => ({
      time: new Date(hour.dt * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      temp: Math.round(hour.main?.temp || 0),
      description: hour.weather?.[0]?.main || 'Unknown',
      icon: getWeatherIcon(hour.weather?.[0]?.main || 'Unknown'),
      humidity: hour.main?.humidity || 0,
      windSpeed: Math.round(hour.wind?.speed || 0),
      feelsLike: Math.round(hour.main?.feels_like || 0)
    }));

    const dailyForecast = [];
    const processedDates = new Set();

    for (const item of forecastResponse.data.list) {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toDateString();

      if (!processedDates.has(dateStr) && dailyForecast.length < 7) {
        processedDates.add(dateStr);
        dailyForecast.push({
          day: getDayName(item.dt),
          date: getFullDate(item.dt),
          description: item.weather?.[0]?.main || 'Unknown',
          icon: getWeatherIcon(item.weather?.[0]?.main || 'Unknown'),
          tempMin: Math.round(item.main?.temp_min || 0),
          tempMax: Math.round(item.main?.temp_max || 0),
          humidity: item.main?.humidity || 0,
          windSpeed: Math.round(item.wind?.speed || 0),
          rainChance: Math.round((item.pop || 0) * 100),
          feelsLike: Math.round(item.main?.feels_like || 0)
        });
      }
    }

    const aqi = airQuality?.main?.aqi || 1;
    const aqiLabels = ['Unknown', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiColors = ['gray', 'green', 'yellow', 'orange', 'red', 'purple'];

    const sunset = new Date(current.sys.sunset * 1000);
    const sunrise = new Date(current.sys.sunrise * 1000);

    const response = {
      city: current.name,
      country: current.sys.country,
      coordinates: { lat, lon },
      current: {
        temp: Math.round(current.main?.temp || 0),
        feelsLike: Math.round(current.main?.feels_like || 0),
        description: current.weather?.[0]?.main || 'Unknown',
        icon: getWeatherIcon(current.weather?.[0]?.main || 'Unknown'),
        humidity: current.main?.humidity || 0,
        pressure: current.main?.pressure || 0,
        visibility: Math.round((current.visibility || 10000) / 1000),
        windSpeed: Math.round(current.wind?.speed || 0),
        windDirection: current.wind?.deg ?? 0,
        windDirectionName: getWindDirection(current.wind?.deg ?? 0),
        cloudiness: current.clouds?.all || 0,
        timestamp: new Date(current.dt * 1000).toLocaleString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      sunCycle: {
        sunrise: sunrise.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        sunset: sunset.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        dayLength: calculateDayLength(sunrise, sunset)
      },
      hourly: hourlyForecast,
      daily: dailyForecast,
      airQuality: {
        aqi: aqi,
        label: aqiLabels[aqi] || 'Unknown',
        color: aqiColors[aqi] || 'gray',
        components: {
          pm25: Math.round((airQuality.components?.pm2_5 || 0) * 10) / 10,
          pm10: Math.round((airQuality.components?.pm10 || 0) * 10) / 10,
          o3: Math.round((airQuality.components?.o3 || 0) * 10) / 10,
          no2: Math.round((airQuality.components?.no2 || 0) * 10) / 10,
          so2: Math.round((airQuality.components?.so2 || 0) * 10) / 10,
          co: Math.round((airQuality.components?.co || 0) * 10) / 10
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

/**
 * GET /api/cities/autocomplete
 * Autocomplete city names
 */
app.get('/api/cities/autocomplete', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const response = await axios.get(`${GEO_URL}/direct`, {
      params: {
        q: query,
        limit: 10,
        appid: API_KEY
      }
    });

    const cities = response.data.map(city => ({
      name: city.name,
      country: city.country,
      state: city.state || '',
      lat: city.lat,
      lon: city.lon,
      displayName: city.state
        ? `${city.name}, ${city.state}, ${city.country}`
        : `${city.name}, ${city.country}`
    }));

    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error.message);
    res.status(500).json({
      error: 'Failed to fetch cities',
      message: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Helper function to get wind direction name
function getWindDirection(degrees) {
  // Guard: if degrees is undefined, null, or NaN, return 'N' as default
  if (degrees === undefined || degrees === null || isNaN(degrees)) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const normalized = ((degrees % 360) + 360) % 360; // safe normalization avoiding NaN
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

// Helper function to calculate day length
function calculateDayLength(sunrise, sunset) {
  // Guard: if either date is invalid, return 'N/A'
  if (!sunrise || !sunset || isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) return 'N/A';
  const diff = sunset - sunrise;
  if (diff < 0) return 'N/A';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

// Start server
app.listen(PORT, () => {
  console.log(`🌤️ SkyCast Backend Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  GET /api/weather/search?city=CityName`);
  console.log(`  GET /api/weather/coordinates?lat=LAT&lon=LON`);
  console.log(`  GET /api/cities/autocomplete?query=CityPrefix`);
  console.log(`  GET /api/health`);
});
