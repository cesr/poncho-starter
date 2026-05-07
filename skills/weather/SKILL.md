---
name: weather
description: Get current weather and daily forecast for a city (defaults to Barcelona)
allowed-tools:
  - ./scripts/fetch-weather.ts
---

# Weather

Use this skill to get weather information for a city.

## Usage

Run the `fetch-weather.ts` script to get current conditions and today's forecast.

### Input (all optional)

- `city` — city name for labeling (default: "Barcelona")
- `latitude` — latitude coordinate (default: 41.39)
- `longitude` — longitude coordinate (default: 2.16)

### Examples

**Barcelona (default):**
No input needed, just run the script.

**Another city:**
```json
{ "city": "Madrid", "latitude": 40.42, "longitude": -3.70 }
```

### Output

Returns an object with:
- `city` — city name
- `current` — temperature, feels like, condition, humidity, wind speed
- `today` — min/max temp, precipitation probability, sunrise, sunset

Present the weather in a clean, readable format. For example:

```
Weather for Barcelona
Current: 22°C (feels like 24°C), Partly cloudy
Humidity: 65%, Wind: 12 km/h
Today: 18°C → 27°C, 10% chance of rain
Sunrise: 6:42, Sunset: 21:28
```
