import { useState, useEffect } from 'react';

const POPULAR_CITIES = [
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456 },
  { name: 'Bandung', country: 'Indonesia', lat: -6.9175, lon: 107.6185 },
  { name: 'Surabaya', country: 'Indonesia', lat: -7.2503, lon: 112.7526 },
  { name: 'Medan', country: 'Indonesia', lat: 3.5869, lon: 98.6768 },
  { name: 'Denpasar', country: 'Indonesia', lat: -8.6545, lon: 115.2261 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
];

const WEATHER_ICONS = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌦️',
  56: '🌧️',
  57: '🌧️',
  61: '🌦️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '❄️',
  73: '❄️',
  75: '❄️',
  77: '❄️',
  80: '🌦️',
  81: '🌧️',
  82: '🌧️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

const WEATHER_DESCRIPTIONS = {
  0: 'Cerah',
  1: 'Hampir Cerah',
  2: 'Sebagian Berawan',
  3: 'Berawan',
  45: 'Kabut',
  48: 'Kabut',
  51: 'Gerimis',
  53: 'Gerimis',
  55: 'Gerimis',
  56: 'Gerimis Beku',
  57: 'Gerimis Beku',
  61: 'Hujan',
  63: 'Hujan',
  65: 'Hujan Lebat',
  66: 'Hujan Beku',
  67: 'Hujan Beku',
  71: 'Salju',
  73: 'Salju',
  75: 'Salju Lebat',
  77: 'Abu Salju',
  80: 'Hujan Badan',
  81: 'Hujan Badan',
  82: 'Hujan Badan',
  85: 'Salju Badan',
  86: 'Salju Badan',
  95: 'Badai Petir',
  96: 'Badai Petir Ringan',
  99: 'Badai Petir Lebat',
};

const getWeatherIcon = (code) => WEATHER_ICONS[code] || '🌤️';
const getWeatherDescription = (code) => WEATHER_DESCRIPTIONS[code] || 'Tidak diketahui';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Fetch weather from Open-Meteo
  const fetchWeather = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation,uv_index,is_day&timezone=auto`
      );
      if (!response.ok) {
        throw new Error('Gagal mengambil data cuaca');
      }
      const data = await response.json();
      const current = data.current;
      const weatherCode = current.weather_code || 0;
      setWeather({
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        precipitation: current.precipitation,
        uvIndex: current.uv_index,
        isDay: current.is_day,
        condition: getWeatherDescription(weatherCode),
        icon: getWeatherIcon(weatherCode),
      });
    } catch (err) {
      setError('Gagal mengambil data cuaca. Coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch location by name using Open-Meteo geocoding
  const fetchLocation = async (query) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=id&format=json`
      );
      if (!response.ok) {
        throw new Error('Gagal mencari lokasi');
      }
      const data = await response.json();
      return data.results || [];
    } catch {
      return [];
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const results = await fetchLocation(searchQuery);
      if (results.length === 0) {
        setError('Lokasi tidak ditemukan. Coba kota lain.');
        setWeather(null);
        setSelectedCity('');
        return;
      }
      // Use the first result
      const loc = results[0];
      setSelectedCity(loc.name);
      await fetchWeather(loc.latitude, loc.longitude);
    } catch (err) {
      setError('Gagal mencari lokasi. Coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when selecting from popular cities
  useEffect(() => {
    if (selectedCity) {
      const city = POPULAR_CITIES.find((c) => c.name === selectedCity);
      if (city) {
        fetchWeather(city.lat, city.lon);
      }
    }
  }, [selectedCity]);

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    const city = POPULAR_CITIES.find((c) => c.name === cityName);
    if (city) {
      fetchWeather(city.lat, city.lon);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">
          <h1>🌤️ Cuaca</h1>
          <p>Perkiraan cuaca untuk setiap lokasi</p>
        </div>
        <div className="header-toggle">
          <span className={`theme-toggle ${weather?.isDay !== undefined ? (weather.isDay ? 'day' : 'night') : ''}`}>
            {weather?.isDay !== undefined ? (weather.isDay ? '☀️' : '🌙') : '🌙'}
          </span>
        </div>
      </header>

      <main className="main">
        <section className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kota / lokasi (contoh: Jakarta, Bandung, Tokyo)"
              onKeyPress={handleKeyPress}
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? '⌛' : '🔍'}
            </button>
          </form>

          <div className="popular-cities">
            <label>Pilih lokasi:</label>
            <div className="city-list">
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  className={`city-item ${selectedCity === city.name ? 'active' : ''}`}
                  onClick={() => handleCitySelect(city.name)}
                >
                  <span>{city.name}</span>
                  <small>{city.country}</small>
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && <div className="error">{error}</div>}

        {loading && !weather && <div className="loading">Memuat cuaca...</div>}

        {weather && (
          <section className="weather-card">
            <div className="weather-header">
              <div className="weather-icon">{weather.icon}</div>
              <div className="weather-details">
                <h2 className="city-name">{selectedCity}</h2>
                <p className="location-sub">{weather.condition}</p>
                <p className="temperature">
                  {weather.temperature.toFixed(1)}°C
                  <small>
                    (feels like {weather.apparentTemperature.toFixed(1)}°C)
                  </small>
                </p>
              </div>
            </div>

            <div className="weather-facts">
              <div className="fact">
                <span className="fact-icon">💧</span>
                <span className="fact-value">{weather.humidity}%</span>
                <span className="fact-label">Kelembapan</span>
              </div>
              <div className="fact">
                <span className="fact-icon">🍃</span>
                <span className="fact-value">{weather.windSpeed?.toFixed(1)} km/j</span>
                <span className="fact-label">Angin</span>
                <small>{weather.windDirection}°</small>
              </div>
              <div className="fact">
                <span className="fact-icon">🌧️</span>
                <span className="fact-value">
                  {weather.precipitation !== undefined ? weather.precipitation.toFixed(1) : '0.0'}
                  mm
                </span>
                <span className="fact-label">Hujan</span>
              </div>
              <div className="fact">
                <span className="fact-icon">☀️</span>
                <span className="fact-value">
                  {weather.uvIndex !== undefined ? weather.uvIndex.toFixed(1) : '0.0'}
                </span>
                <span className="fact-label">UV Index</span>
              </div>
            </div>

            <div className="weather-footer">
              <span className="footer-badge">
                {weather.isDay !== undefined && weather.isDay ? '☀️' : '🌙'} {weather.isDay !== undefined ? (weather.isDay ? 'Siang' : 'Malam') : ''}
              </span>
              <span className="footer-note">Data: Open-Meteo (free weather API)</span>
            </div>
          </section>
        )}

        {!weather && !loading && !error && (
          <div className="empty-state">
            <p>Pilih atau cari lokasi untuk melihat perkiraan cuaca.</p>
            <p>Gunakan kolom pencarian atau pilih dari daftar kota populer.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Cuaca Web App &mdash;Built with React, Vite, &amp; Open-Meteo</p>
      </footer>
    </div>
  );
}

export default App;
