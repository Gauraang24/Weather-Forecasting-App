const userLocation = document.getElementById('userLocation');
const converter = document.getElementById("converter");
const weatherIcon = document.querySelector('.weatherIcon');
const temperature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feelsLike");
const description = document.querySelector(".description");
const date = document.querySelector(".date");
const city = document.querySelector(".city");
const HValue = document.getElementById("HValue");
const WValue = document.getElementById("WValue");
const SRValue = document.getElementById("SRValue");
const SSValue = document.getElementById("SSValue");
const CValue = document.getElementById("CValue");
const UVValue = document.getElementById("UVValue");
const PValue = document.getElementById("PValue");
const Forecast = document.querySelector(".Forecast");

const WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=335b8ba20f78d2274b86111fb4f53a25&q=`;
const WEATHER_DATA_ENDPOINT = "https://api.openweathermap.org/data/3.0/onecall?appid=335b8ba20f78d2274b86111fb4f53a25&exclude=minutely&units=metric&";

function findUserLocation() {
    Forecast.innerHTML = ''; // Clear previous forecast data
    const location = userLocation.value.trim();

    // Check if location input is empty
    if (!location) {
        alert('Please enter a location');
        return;
    }

    fetch(WEATHER_API_ENDPOINT + location)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            if (data.cod != 200) { // Handle non-successful responses
                alert(data.message);
                return;
            }

            city.innerHTML = `${data.name}, ${data?.sys?.country}`;
            weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data?.weather[0]?.icon}@2x.png)`;

            fetch(WEATHER_DATA_ENDPOINT + `lon=${data.coord.lon}&lat=${data.coord.lat}`)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((weatherData) => {
                    temperature.innerHTML = TempConverter(weatherData?.current?.temp);
                    feelsLike.innerHTML = `Feels like ${TempConverter(weatherData?.current?.feels_like)}`;
                    description.innerHTML = `<i class='fa-brands fa-cloudversify'></i> &nbsp;${weatherData?.current.weather[0]?.description}`;

                    const options = {
                        weekday: 'long',
                        month: "long",
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    };
                    date.innerHTML = getLongFormatDateValue(weatherData.current.dt, weatherData.timezone_offset, options);

                    HValue.innerHTML = `${Math.round(weatherData?.current?.humidity)}<span>%</span>`;
                    WValue.innerHTML = `${Math.round(weatherData?.current?.wind_speed)}<span>m/s</span>`;
                    const options1 = {
                        hour: 'numeric',
                        minute: "numeric",
                        hour12: true
                    };
                    SRValue.innerHTML = getLongFormatDateValue(weatherData.current.sunrise, weatherData.timezone_offset, options1);
                    SSValue.innerHTML = getLongFormatDateValue(weatherData.current.sunset, weatherData.timezone_offset, options1);

                    CValue.innerHTML = `${Math.round(weatherData?.current?.clouds)}<span>%</span>`;
                    UVValue.innerHTML = Math.round(weatherData?.current?.uvi);
                    PValue.innerHTML = `${Math.round(weatherData?.current?.pressure)}<span>hPa</span>`;

                    //Daily Section
                    weatherData.daily.forEach((weather) => {
                        let div = document.createElement('div');

                        const options = {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        };

                        let daily = getLongFormatDateValue(weather.dt, weatherData.timezone_offset, options).split(' at ');
                        div.innerHTML = daily[0];
                        div.innerHTML += `<img src='https://openweathermap.org/img/wn/${weather?.weather[0]?.icon}@2x.png' />`;
                        div.innerHTML += `<p class='forecast-desc'>${weather.weather[0].description}</p>`;
                        div.innerHTML += `<span>${TempConverter(weather.temp.min)}&nbsp;<span>${TempConverter(weather.temp.max)}</span></span>`;

                        Forecast.append(div);
                    });
                })
                .catch((error) => {
                    console.error("Error fetching weather data:", error); // Log any errors from the second fetch
                    alert('Error fetching weather data.');
                });
        })
        .catch((error) => {
            console.error("Error fetching location data:", error); // Log any errors from the first fetch
            alert('Error fetching location data.');
        });
}

function formatUnixTime(dtValue, offSet, options = {}) {
    const date = new Date((dtValue + offSet) * 1000);
    return date.toLocaleTimeString([], { timeZone: 'UTC', ...options });
}

function getLongFormatDateValue(dtValue, offSet, options) {
    return formatUnixTime(dtValue, offSet, options);
}

function TempConverter(temp) {
    let tempValue = Math.round(temp);
    let message = '';
    if (converter.value === '*C') {
        message = `${tempValue}<span>&#176;C</span>`;
    } else {
        let ctof = (tempValue * 9) / 5 + 32;
        message = `${Math.round(ctof)}<span>&#176;F</span>`;
    }
    return message;
}