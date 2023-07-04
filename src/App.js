import React, { useState, useEffect } from 'react';

const api = {
  key: "603170bc62cbfa93acfa89395ca3903a",
  base: "https://api.openweathermap.org/data/2.5/",
  forecastEndpoint: "forecast",
};

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState({});
  const [unit, setUnit] = useState('imperial'); // Default to Fahrenheit
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeatherDataByCoords(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, []);

  const getWeatherDataByCoords = (latitude, longitude) => {
    fetch(`${api.base}weather?lat=${latitude}&lon=${longitude}&units=${unit}&APPID=${api.key}`)
      .then((res) => res.json())
      .then((result) => {
        setWeather(result);
        setQuery('');
        showNotification(result);
      });

    fetch(`${api.base}${api.forecastEndpoint}?lat=${latitude}&lon=${longitude}&units=${unit}&APPID=${api.key}`)
      .then((res) => res.json())
      .then((result) => {
        setForecast(result.list);
      });
  };

  const search = (evt) => {
    if (evt.key === "Enter") {
      // Fetch current weather data
      fetch(`${api.base}weather?q=${query}&units=${unit}&APPID=${api.key}`)
        .then(res => res.json())
        .then(result => {
          setWeather(result);
          setQuery('');
          showNotification(result);
        });

      // Fetch forecast data
      fetch(`${api.base}${api.forecastEndpoint}?q=${query}&units=${unit}&APPID=${api.key}`)
        .then(res => res.json())
        .then(result => {
          setForecast(result.list);
        });
    }
  };

  const toggleUnit = (selectedUnit) => {
    setUnit(selectedUnit);
    if (query !== '') {
      search({ key: 'Enter' });
    }
  };

  const dateBuilder = (d) => {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();

    return `${month} ${date}, ${year}`;
  };

  const convertTemp = (temp) => {
    if (unit === 'imperial') {
      return Math.round(temp) + '°F';
    } else {
      return Math.round((temp - 32) * 5 / 9) + '°C';
    }
  };

  const showNotification = (weatherData) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(`Weather in ${weatherData.name}`, {
        body: `Temperature: ${convertTemp(weatherData.main.temp)}\nWeather: ${weatherData.weather[0].main}`,
      });
    }
  };

  return (
    <div className={(typeof weather.main !== "undefined") ? ((weather.main.temp > 16) ? 'app warm' : 'app') : 'app'}>
      <main>
        <div className="search-box">
          <input
            type="text"
            className="search-bar"
            placeholder="Search..."
            onChange={e => setQuery(e.target.value)}
            value={query}
            onKeyDown={search}
          />
        </div>
        <div className="unit-toggle">
          <label>
            <input type="radio" name="unit" value="imperial" checked={unit === 'imperial'} onChange={() => toggleUnit('imperial')} />
            <span>Fahrenheit</span>
          </label>
          <label>
            <input type="radio" name="unit" value="metric" checked={unit === 'metric'} onChange={() => toggleUnit('metric')} />
            <span>Celsius</span>
          </label>
        </div>
        {(typeof weather.main !== "undefined") ? (
          <div>
            <div className="location-box">
              <div className="location">{weather.name}, {weather.sys.country}</div>
              <div className="date">{dateBuilder(new Date())}</div>
            </div>
            <div className="weather-box">
              <div className="temp">
                {convertTemp(weather.main.temp)}
              </div>
              <div className="weather">{weather.weather[0].main}</div>
              <div className="extra-info">
                <div>Humidity: {weather.main.humidity}%</div>
                <div>Wind Speed: {weather.wind.speed} mph</div>
                <div>Visibility: {weather.visibility} meters</div>
              </div>
            </div>
            <div className="forecast">
              {forecast.map(item => (
                <div key={item.dt}>
                  <div>Date: {item.dt_txt}</div>
                  <div>Temperature: {item.main.temp}</div>
                  <div>Weather: {item.weather[0].main}</div>
                  {/* Add additional forecast data as needed */}
                </div>
              ))}
            </div>
          </div>
        ) : ('')}
      </main>
    </div>
  );
}

export default App;
