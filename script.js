// Get multiple elements by their ids
const getById = (id) => document.getElementById(id);
// Get multiple elements by their selectors
const getBySelector = (selector) => document.querySelector(selector);

const elements = {
    userLocation: getById('userLocation'),
    converter: getById("converter"),
    weatherIcon: getBySelector('.weatherIcon'),
    temperature: getBySelector(".temperature"),
    feelsLike: getBySelector(".feelsLike"),
    description: getBySelector(".description"),
    date: getBySelector(".date"),
    city: getBySelector(".city"),
    HValue: getById("HValue"),
    WValue: getById("WValue"),
    SRValue: getById("SRValue"),
    SSValue: getById("SSValue"),
    CValue: getById("CValue"),
    UVValue: getById("UVValue"),
    PValue: getById("PValue"),
    Forecast: getBySelector(".Forecast"),
    recentSearches: getById("recentSearches"),
};

const WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=335b8ba20f78d2274b86111fb4f53a25&q=`;
const WEATHER_DATA_ENDPOINT = "https://api.openweathermap.org/data/3.0/onecall?appid=335b8ba20f78d2274b86111fb4f53a25&exclude=minutely&units=metric&";

// Load recent searches from localStorage
document.addEventListener('DOMContentLoaded', loadRecentSearches);

function loadRecentSearches() {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (recentSearches.length) {
        elements.recentSearches.style.display = 'block';
        elements.recentSearches.innerHTML = recentSearches.map(city => `<option value="${city}">${city}</option>`).join('');
    } else {
        elements.recentSearches.style.display = 'none';
    }
}

function updateRecentSearches(city) {
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (!recentSearches.includes(city)) {
        recentSearches.push(city);
        if (recentSearches.length > 5) {
            recentSearches.shift(); // Keep only last 5 searches
        }
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        loadRecentSearches();
    }
}
function selectCity() {
    elements.userLocation.value = elements.recentSearches.value;
    findUserLocation();
}


// Add event listener for the "Current Location" button
getById('current-location-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

function showPosition(position) {
    fetchWeatherDataByCoordinates(position.coords.latitude, position.coords.longitude);
}

function showError(error) {
    const errorMessages = {
        [error.PERMISSION_DENIED]: "User denied the request for Geolocation.",
        [error.POSITION_UNAVAILABLE]: "Location information is unavailable.",
        [error.TIMEOUT]: "The request to get user location timed out.",
        [error.UNKNOWN_ERROR]: "An unknown error occurred."
    };
    alert(errorMessages[error.code] || "An unknown error occurred.");
}

function fetchWeatherDataByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=335b8ba20f78d2274b86111fb4f53a25&units=metric`;

    fetch(url)
        .then(handleResponse)
        .then(data => {
            updateWeather(data);
            return fetch(WEATHER_DATA_ENDPOINT + `lon=${data.coord.lon}&lat=${data.coord.lat}`);
        })
        .then(handleResponse)
        .then(updateDetailedWeather)
        .catch(handleError);
}

function handleResponse(res) {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
}

function handleError(error) {
    console.error("Error fetching data:", error);
    alert('Error fetching data.');
}

function updateWeather(data) {
    elements.city.innerHTML = `${data.name}, ${data.sys.country}`;
    elements.weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;
}

function updateDetailedWeather(weatherData) {
    const { temperature, feelsLike, description, date, HValue, WValue, SRValue, SSValue, CValue, UVValue, PValue, Forecast } = elements;
    const options = { weekday: 'long', month: "long", day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const options1 = { hour: 'numeric', minute: "numeric", hour12: true };

    temperature.innerHTML = TempConverter(weatherData.current.temp);
    feelsLike.innerHTML = `Feels like ${TempConverter(weatherData.current.feels_like)}`;
    description.innerHTML = `<i class='fa-brands fa-cloudversify'></i> &nbsp;${weatherData.current.weather[0].description}`;
    date.innerHTML = getLongFormatDateValue(weatherData.current.dt, weatherData.timezone_offset, options);

    HValue.innerHTML = `${Math.round(weatherData.current.humidity)}<span>%</span>`;
    WValue.innerHTML = `${Math.round(weatherData.current.wind_speed)}<span>m/s</span>`;
    SRValue.innerHTML = getLongFormatDateValue(weatherData.current.sunrise, weatherData.timezone_offset, options1);
    SSValue.innerHTML = getLongFormatDateValue(weatherData.current.sunset, weatherData.timezone_offset, options1);

    CValue.innerHTML = `${Math.round(weatherData.current.clouds)}<span>%</span>`;
    UVValue.innerHTML = Math.round(weatherData.current.uvi);
    PValue.innerHTML = `${Math.round(weatherData.current.pressure)}<span>hPa</span>`;

    updateForecast(weatherData.daily, weatherData.timezone_offset);
}

function updateForecast(dailyWeather, timezone_offset) {
    elements.Forecast.innerHTML = '';
    dailyWeather.forEach((weather) => {
        const div = document.createElement('div');
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const daily = getLongFormatDateValue(weather.dt, timezone_offset, options).split(' at ');

        div.innerHTML = `${daily[0]} <img src='https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png' />
                         <p class='forecast-desc'>${weather.weather[0].description}</p>
                         <span>${TempConverter(weather.temp.min)}&nbsp;<span>${TempConverter(weather.temp.max)}</span></span>`;
        elements.Forecast.append(div);
    });
}

function findUserLocation() {
    const location = elements.userLocation.value.trim();
    if (!location) {
        alert('Please enter a location');
        return;
    }

    fetch(WEATHER_API_ENDPOINT + location)
        .then(handleResponse)
        .then(data => {
            if (data.cod !== 200) {
                alert(data.message);
                return;
            }
            updateWeather(data);
            updateRecentSearches(data.name);
            return fetch(WEATHER_DATA_ENDPOINT + `lon=${data.coord.lon}&lat=${data.coord.lat}`);
        })
        .then(handleResponse)
        .then(updateDetailedWeather)
        .catch(handleError);
}


function formatUnixTime(dtValue, offSet, options = {}) {
    return new Date((dtValue + offSet) * 1000).toLocaleTimeString([], { timeZone: 'UTC', ...options });
}

function getLongFormatDateValue(dtValue, offSet, options) {
    return formatUnixTime(dtValue, offSet, options);
}

function TempConverter(temp) {
    const tempValue = Math.round(temp);
    return elements.converter.value === '°C' ?
        `${tempValue}<span>&#176;C</span>` :
        `${Math.round(tempValue * 9 / 5 + 32)}<span>&#176;F</span>`;
}
