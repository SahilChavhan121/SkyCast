# SkyCast Weather App - Backend Setup Guide

A modern weather application with real-time data integration using OpenWeatherMap API. Features current weather, hourly forecasts, 7-day predictions, and air quality information.

## Features

✨ **Real-time Weather Data**
- Current weather conditions with temperature, humidity, and wind speed
- Hourly forecast for the next 8 hours
- 7-day extended forecast
- Air quality monitoring with AQI levels

📍 **Location Services**
- City search with autocomplete suggestions
- Geographical coordinates support
- Multiple location support

🎨 **Rich User Interface**
- Responsive design (mobile, tablet, desktop)
- Material Design icons
- Smooth animations and transitions
- Real-time data updates

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Axios** - HTTP client
- **CORS** - Cross-Origin Resource Sharing
- **Dotenv** - Environment variables management

### Frontend
- **HTML5** - Markup
- **Tailwind CSS** - Styling framework
- **Material Symbols** - Icon library
- **Vanilla JavaScript** - Interactivity

### APIs
- **OpenWeatherMap** - Weather and pollution data

## Prerequisites

Before you begin, ensure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **OpenWeatherMap API Key** - [Get Free API Key](https://openweathermap.org/api)

## Installation

### 1. Clone or Download the Project

```bash
# Create project directory
mkdir skycast-weather
cd skycast-weather
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `axios` - HTTP requests
- `cors` - Enable cross-origin requests
- `dotenv` - Environment configuration
- `nodemon` (dev) - Auto-restart during development

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenWeatherMap API key:

```env
OPENWEATHER_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

**Get Your API Key:**
1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key and paste it in `.env`

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start at: `http://localhost:5000`

You should see:
```
🌤️ SkyCast Backend Server running on http://localhost:5000
Available endpoints:
  GET /api/weather/search?city=CityName
  GET /api/weather/coordinates?lat=LAT&lon=LON
  GET /api/cities/autocomplete?query=CityPrefix
  GET /api/health
```

## API Endpoints

### 1. Search Weather by City Name

```
GET /api/weather/search?city=London
```

**Query Parameters:**
- `city` (required) - City name (e.g., "London", "New York", "Tokyo")

**Response Example:**
```json
{
  "city": "London",
  "country": "GB",
  "coordinates": { "lat": 51.5085, "lon": -0.1257 },
  "current": {
    "temp": 15,
    "feelsLike": 14,
    "description": "Cloudy",
    "icon": "cloud",
    "humidity": 72,
    "pressure": 1013,
    "visibility": 10,
    "windSpeed": 12,
    "windDirection": 230,
    "windDirectionName": "SW",
    "timestamp": "Monday, Apr 04, 2026, 2:30 PM"
  },
  "sunCycle": {
    "sunrise": "06:15 AM",
    "sunset": "08:45 PM",
    "dayLength": "14h 30m"
  },
  "hourly": [
    {
      "time": "02:30 PM",
      "temp": 15,
      "description": "Cloudy",
      "icon": "cloud",
      "humidity": 72,
      "windSpeed": 12,
      "feelsLike": 14
    }
  ],
  "daily": [
    {
      "day": "Today",
      "date": "Monday, April 04, 2026",
      "description": "Cloudy",
      "icon": "cloud",
      "tempMin": 12,
      "tempMax": 18,
      "humidity": 72,
      "windSpeed": 12,
      "rainChance": 40,
      "feelsLike": 14
    }
  ],
  "airQuality": {
    "aqi": 2,
    "label": "Fair",
    "components": {
      "pm25": 18.5,
      "pm10": 32.2,
      "o3": 45.3,
      "no2": 28.1,
      "so2": 12.5,
      "co": 450.2
    }
  }
}
```

### 2. Search Weather by Coordinates

```
GET /api/weather/coordinates?lat=51.5085&lon=-0.1257
```

**Query Parameters:**
- `lat` (required) - Latitude (-90 to 90)
- `lon` (required) - Longitude (-180 to 180)

**Response:** Same structure as city search

### 3. Autocomplete City Names

```
GET /api/cities/autocomplete?query=Lon
```

**Query Parameters:**
- `query` (required) - City name prefix (minimum 2 characters)

**Response Example:**
```json
[
  {
    "name": "London",
    "country": "GB",
    "state": "England",
    "lat": 51.5085,
    "lon": -0.1257,
    "displayName": "London, England, GB"
  },
  {
    "name": "Londonderry",
    "country": "GB",
    "state": "Northern Ireland",
    "lat": 55.0041,
    "lon": -7.3087,
    "displayName": "Londonderry, Northern Ireland, GB"
  }
]
```

### 4. Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "Backend is running"
}
```

## Opening the Frontend

Once the backend is running:

1. **Open the HTML file directly:**
   - Simply open `index.html` in your web browser
   - Or use a local server: `python -m http.server 8000`

2. **Default Search:**
   - The app loads with London's weather by default
   - Use the search bar to find any city worldwide

## Frontend Features

### Search Bar
- Type a city name to see autocomplete suggestions
- Press Enter or click a suggestion to fetch weather
- Real-time autocomplete with debouncing

### Current Weather Section
- Large temperature display
- Weather condition with icon
- "Feels like" temperature
- Quick stats: Humidity, Wind Speed, UV Index

### Hourly Forecast
- 8-hour forecast cards
- Temperature and weather condition for each hour
- Scrollable horizontal layout

### Detailed Metrics
- **Sun Cycle**: Sunrise and sunset times with visual representation
- **Humidity**: Circular progress indicator with dew point
- **Wind**: Compass visualization with direction and speed
- **Visibility & Pressure**: Current atmospheric conditions

### 7-Day Forecast
- Daily weather predictions
- Min/max temperatures
- Rain probability
- Weather icons

### Air Quality
- AQI (Air Quality Index) with color coding
- Individual pollutant levels: PM2.5, PM10, O3
- Air quality descriptions

## Environment Setup Details

### macOS/Linux

```bash
# Install Node.js using Homebrew
brew install node

# Verify installation
node --version
npm --version

# Create project
mkdir skycast && cd skycast
npm init -y
npm install express axios cors dotenv
```

### Windows

1. Download Node.js from https://nodejs.org/
2. Run the installer
3. Open Command Prompt and verify:
   ```cmd
   node --version
   npm --version
   ```

## Troubleshooting

### "Module not found" Error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### API Key Not Working
- Verify API key in `.env` file
- Check OpenWeatherMap API limits (free tier: 60 calls/min)
- Ensure API key is for "Current weather data" and "Forecast 5-day" APIs

### CORS Error
- Backend must be running on `http://localhost:5000`
- Check that CORS middleware is enabled in `server.js`
- Clear browser cache

### City Not Found
- Try alternative spelling or country code
- Use coordinates instead of city name
- Check OpenWeatherMap API documentation for supported locations

### Port Already in Use
```bash
# Change PORT in .env to 5001 or higher
PORT=5001
```

## API Limits

**OpenWeatherMap Free Tier:**
- 60 calls per minute
- 1,000 calls per day
- No data older than 5 days (forecast)

For production, consider upgrading to a paid plan.

## Performance Tips

1. **Implement Caching**: Cache weather data to avoid repeated API calls
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Error Handling**: Gracefully handle API failures
4. **Data Compression**: Use gzip compression for responses
5. **CDN**: Serve static files through a CDN

## Security Recommendations

1. **Never commit `.env` file** - Use `.env.example` template
2. **Validate Input**: Sanitize city names and coordinates
3. **HTTPS**: Use HTTPS in production
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **CORS Policy**: Restrict CORS origins in production

## Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add environment variables
heroku config:set OPENWEATHER_API_KEY=your_key_here

# Deploy
git push heroku main
```

### Deploy to AWS, Google Cloud, or Azure
Follow platform-specific Node.js deployment guides.

## Project Structure

```
skycast-weather/
├── server.js              # Express server with API endpoints
├── index.html             # Frontend HTML with integrated JavaScript
├── package.json           # Project dependencies
├── .env.example           # Environment variables template
├── .env                   # Local environment variables (git-ignored)
├── node_modules/          # Installed dependencies
├── package-lock.json      # Locked dependency versions
└── README.md             # This file
```

## API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing parameters) |
| 404 | Not Found (city doesn't exist) |
| 500 | Server Error |

## Contributing

Feel free to fork, modify, and submit improvements!

## License

MIT License - Feel free to use for personal and commercial projects.

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review OpenWeatherMap API documentation
3. Check browser console for error messages
4. Verify `.env` configuration

## Resources

- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Material Design Icons](https://fonts.google.com/icons)
- [Node.js Documentation](https://nodejs.org/docs/)

---

Built with ☀️ and ❄️ for weather enthusiasts everywhere.

