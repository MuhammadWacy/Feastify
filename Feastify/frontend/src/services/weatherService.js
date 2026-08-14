const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const weatherCodeLabels = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
};

const toDateOnly = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

const getLocation = async (city) => {
    const query = String(city || "").trim();

    if (query.length < 2) {
        throw new Error("Enter an event city or area first.");
    }

    const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.reason || "Could not find that location.");
    }

    const location = data?.results?.[0];

    if (!location) {
        throw new Error("Location not found. Try a city name such as Dhaka.");
    }

    return location;
};

const getForecast = async (latitude, longitude) => {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "wind_speed_10m_max",
        ].join(","),
        timezone: "auto",
        forecast_days: "16",
    });

    const response = await fetch(`${FORECAST_URL}?${params.toString()}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.reason || "Could not load the weather forecast.");
    }

    return data;
};

const makeWeatherResult = (forecast, index, location, eventDate, forecastAvailable) => {
    const daily = forecast.daily || {};
    const weatherCode = daily.weather_code?.[index];

    return {
        forecastAvailable,
        eventDate,
        forecastDate: daily.time?.[index] || "",
        locationName: [location.name, location.admin1, location.country]
            .filter(Boolean)
            .join(", "),
        condition: weatherCodeLabels[weatherCode] || "Weather information available",
        maxTemperature: daily.temperature_2m_max?.[index],
        minTemperature: daily.temperature_2m_min?.[index],
        rainChance: daily.precipitation_probability_max?.[index],
        maxWindSpeed: daily.wind_speed_10m_max?.[index],
        temperatureUnit: forecast.daily_units?.temperature_2m_max || "°C",
        windUnit: forecast.daily_units?.wind_speed_10m_max || "km/h",
    };
};

export const getEventWeather = async ({ city, eventDate }) => {
    const location = await getLocation(city);
    const forecast = await getForecast(location.latitude, location.longitude);

    const requestedDate = toDateOnly(eventDate);
    const availableDates = forecast.daily?.time || [];
    const matchingIndex = availableDates.indexOf(requestedDate);

    if (matchingIndex >= 0) {
        return makeWeatherResult(
            forecast,
            matchingIndex,
            location,
            requestedDate,
            true
        );
    }

    if (availableDates.length === 0) {
        throw new Error("Open-Meteo did not return forecast data for this location.");
    }

    return makeWeatherResult(
        forecast,
        0,
        location,
        requestedDate,
        false
    );
};
