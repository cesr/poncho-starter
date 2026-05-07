const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
}

interface Input {
  city?: string
  latitude?: number
  longitude?: number
  days?: number
}

export default async function fetchWeather(input?: Input) {
  const city = input?.city ?? 'Barcelona'
  const lat = input?.latitude ?? 41.39
  const lon = input?.longitude ?? 2.16
  const days = Math.min(Math.max(input?.days ?? 1, 1), 16)

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'relative_humidity_2m',
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'weather_code',
      'sunrise',
      'sunset',
    ].join(','),
    timezone: 'auto',
    forecast_days: days.toString(),
  })

  const url = `https://api.open-meteo.com/v1/forecast?${params}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()

  const current = data.current
  const daily = data.daily

  const weatherCode = current.weather_code as number
  const condition = WMO_CODES[weatherCode] ?? `Unknown (code ${weatherCode})`

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const forecast: {
    date: string
    condition: string
    minTemp: string
    maxTemp: string
    precipitationProbability: string
    sunrise: string
    sunset: string
  }[] = []
  for (let i = 0; i < days; i++) {
    const dayCode = daily.weather_code[i] as number
    forecast.push({
      date: daily.time[i],
      condition: WMO_CODES[dayCode] ?? `Unknown (code ${dayCode})`,
      minTemp: `${daily.temperature_2m_min[i]}°C`,
      maxTemp: `${daily.temperature_2m_max[i]}°C`,
      precipitationProbability: `${daily.precipitation_probability_max[i]}%`,
      sunrise: formatTime(daily.sunrise[i]),
      sunset: formatTime(daily.sunset[i]),
    })
  }

  return {
    city,
    current: {
      temperature: `${current.temperature_2m}°C`,
      feelsLike: `${current.apparent_temperature}°C`,
      condition,
      humidity: `${current.relative_humidity_2m}%`,
      windSpeed: `${current.wind_speed_10m} km/h`,
    },
    forecast,
  }
}
