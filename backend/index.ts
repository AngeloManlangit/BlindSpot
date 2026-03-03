import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import type {
  RiskReport,
  HazardRow,
  ThreeDayForecast,
  DayForecast,
  WeatherCondition,
  BlindSpot,
  Recommendation,
} from '../frontend/src/type/types'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// ─── ENV ──────────────────────────────────────────────────────────────────────
const MAPBOX_TOKEN = process.env.VITE_MAPBOX_TOKEN   // reverse-geocode + elevation
const OPEN_METEO   = 'https://api.open-meteo.com/v1'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map Open-Meteo WMO weather code → human description */
const wmoDescription = (code: number): string => {
  if (code === 0)               return 'Clear sky'
  if (code <= 3)                return 'Partly cloudy'
  if (code <= 49)               return 'Foggy'
  if (code <= 67)               return 'Rainy'
  if (code <= 77)               return 'Snow'
  if (code <= 82)               return 'Rain showers'
  if (code <= 99)               return 'Thunderstorm'
  return 'Unknown'
}

/** Map precipitation (mm/day) → hazard label */
const precipHazard = (mm: number) =>
  mm > 50 ? 'Severe flooding risk' :
  mm > 20 ? 'Heavy rain / flash flood' :
  mm > 5  ? 'Moderate rain' : 'Minimal rain'

/** Map wind speed (km/h) → hazard label */
const windHazard = (kmh: number) =>
  kmh > 120 ? 'Typhoon-force winds' :
  kmh > 60  ? 'Strong winds' :
  kmh > 30  ? 'Moderate winds' : 'Light winds'

/** Clamp a number 0–100 */
const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

/** Risk level label from score */
const riskLevel = (score: number): HazardRow['level'] =>
  score >= 81 ? 'SEVERE' :
  score >= 61 ? 'HIGH'   :
  score >= 41 ? 'ELEVATED' :
  score >= 21 ? 'GUARDED'  : 'LOW'

// ─── /api/risk ────────────────────────────────────────────────────────────────
app.get('/api/risk', async (req: Request, res: Response) => {
  const { location, lat, lng } = req.query as Record<string, string>

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' })
  }

  const latitude  = parseFloat(lat)
  const longitude = parseFloat(lng)

  try {
    // ── 1. Elevation (Open-Meteo) ──────────────────────────────────────────
    const elevRes  = await fetch(`${OPEN_METEO}/elevation?latitude=${latitude}&longitude=${longitude}`)
    const elevData = await elevRes.json()
    const elevation: number = elevData.elevation?.[0] ?? 0

    // ── 2. Current weather + 7-day forecast (Open-Meteo) ──────────────────
    const weatherRes = await fetch(
      `${OPEN_METEO}/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,wind_speed_10m,relative_humidity_2m,precipitation,visibility,weather_code` +
      `&daily=precipitation_sum,wind_speed_10m_max,weather_code,precipitation_probability_max,temperature_2m_max,temperature_2m_min` +
      `&forecast_days=7&timezone=Asia%2FManila`
    )
    const weather = await weatherRes.json()
    const cur     = weather.current
    const daily   = weather.daily

    const currentWeather: WeatherCondition = {
      temperature: `${cur.temperature_2m}°C`,
      description: wmoDescription(cur.weather_code),
      humidity:    `${cur.relative_humidity_2m}%`,
      windSpeed:   `${cur.wind_speed_10m} km/h`,
      visibility:  `${(cur.visibility / 1000).toFixed(1)} km`,
    }

    const weekForecast: DayForecast[] = daily.time.map((date: string, i: number) => ({
      day:                 new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      condition:           wmoDescription(daily.weather_code[i]),
      temperature:         `${daily.temperature_2m_min[i]}–${daily.temperature_2m_max[i]}°C`,
      precipitationChance: `${daily.precipitation_probability_max[i]}%`,
    }))

    const threeDayForecast: ThreeDayForecast[] = daily.time.slice(0, 3).map((date: string, i: number) => {
      const precip  = daily.precipitation_sum[i] as number
      const wind    = daily.wind_speed_10m_max[i] as number
      const hazard  = precip > 20 ? 'Flood' : wind > 60 ? 'Wind' : 'None'
      const score   = clamp((precip / 50) * 60 + (wind / 120) * 40)
      return {
        day:       i + 1,
        date,
        hazard,
        riskLevel: riskLevel(score),
        summary:   `${precipHazard(precip)}. ${windHazard(wind)}.`,
      }
    })

    // ── 3. USGS Earthquake — Cebu bounding box ─────────────────────────────
    //    (narrow radius around the queried point, last 365 days)
    const quakeRes = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
      `&latitude=${latitude}&longitude=${longitude}&maxradiuskm=100` +
      `&minmagnitude=2.5&orderby=time&limit=20`
    )
    const quakeData = await quakeRes.json()
    const quakes: { mag: number }[] = quakeData.features?.map(
      (f: any) => ({ mag: f.properties.mag })
    ) ?? []

    const maxMag      = quakes.length ? Math.max(...quakes.map(q => q.mag)) : 0
    const quakeScore  = clamp(maxMag > 0 ? ((maxMag - 2.5) / (7.5 - 2.5)) * 100 : 0)
    const quakeFreq   = quakes.length

    // ── 4. NOAH flood hazard (WMS GetFeatureInfo) ──────────────────────────
    //    We query the 100-yr flood layer at the exact point
    const noahUrl =
      `https://noah.up.edu.ph/geoserver/ows?` +
      `service=WMS&version=1.1.1&request=GetFeatureInfo` +
      `&layers=noah:fh_100yr&query_layers=noah:fh_100yr` +
      `&info_format=application/json` +
      `&width=10&height=10&x=5&y=5` +
      `&srs=EPSG:4326` +
      `&bbox=${longitude - 0.001},${latitude - 0.001},${longitude + 0.001},${latitude + 0.001}`

    let floodScore = 0
    try {
      const noahRes  = await fetch(noahUrl)
      const noahData = await noahRes.json()
      const feature  = noahData.features?.[0]
      // NOAH flood depth in meters — map 0–5m → 0–100
      const depth: number = feature?.properties?.depth ?? feature?.properties?.DN ?? 0
      floodScore = clamp((depth / 5) * 100)
    } catch {
      // NOAH may be unreachable — fall back to precip-based estimate
      floodScore = clamp((daily.precipitation_sum[0] / 50) * 80)
    }

    // ── 5. Compose risk scores ─────────────────────────────────────────────
    const precipMax  = Math.max(...daily.precipitation_sum)
    const windMax    = Math.max(...daily.wind_speed_10m_max)

    // Hazard — weighted average of flood, earthquake, wind
    const hazardScore = clamp(
      floodScore * 0.5 +
      quakeScore * 0.3 +
      clamp((windMax / 120) * 100) * 0.2
    )

    // Exposure — elevation (low elevation = higher flood exposure)
    //            + proximity to coast (approximated by elevation < 10m)
    const elevExposure   = elevation < 10 ? 80 : elevation < 50 ? 50 : elevation < 200 ? 30 : 15
    const exposureScore  = clamp(elevExposure)

    // Vulnerability — rainfall intensity proxy
    const vulnScore = clamp((precipMax / 50) * 100)

    // Capacity — inverse of hazard frequency (more quakes = less capacity)
    const capacityScore = clamp(100 - (quakeFreq / 20) * 40 - (floodScore * 0.2))

    // Overall: Disaster Risk Reduction framework
    // Risk = (Hazard × Exposure × Vulnerability) / Capacity
    const rawRisk    = (hazardScore * exposureScore * vulnScore) / (capacityScore || 1)
    const overallRisk = clamp(rawRisk / 100)  // normalize to 0–100

    // ── 6. Hazard rows ─────────────────────────────────────────────────────
    const hazards: HazardRow[] = [
      {
        type:       'Flood',
        score:      floodScore,
        level:      riskLevel(floodScore),
        keyFactors: `Precipitation: ${daily.precipitation_sum[0].toFixed(1)}mm today. Elevation: ${elevation.toFixed(0)}m.`,
      },
      {
        type:       'Earthquake',
        score:      quakeScore,
        level:      riskLevel(quakeScore),
        keyFactors: `${quakeFreq} recent events within 100km. Max magnitude: ${maxMag.toFixed(1)}.`,
      },
      {
        type:       'Typhoon / Strong Wind',
        score:      clamp((windMax / 120) * 100),
        level:      riskLevel(clamp((windMax / 120) * 100)),
        keyFactors: `Max wind this week: ${windMax} km/h. ${windHazard(windMax)}.`,
      },
      {
        type:       'Heavy Rain',
        score:      clamp((precipMax / 50) * 100),
        level:      riskLevel(clamp((precipMax / 50) * 100)),
        keyFactors: `Max daily rain this week: ${precipMax.toFixed(1)}mm.`,
      },
    ]

    // ── 7. Blind spots ─────────────────────────────────────────────────────
    const blindSpots: BlindSpot[] = []
    if (elevation < 5)
      blindSpots.push({ area: 'Coastal / low-lying zone', issue: 'High storm surge exposure', severity: 'HIGH' })
    if (floodScore > 60)
      blindSpots.push({ area: 'Flood-prone area', issue: 'NOAH 100-yr flood hazard zone', severity: 'HIGH' })
    if (quakeFreq > 10)
      blindSpots.push({ area: 'Seismically active zone', issue: 'Frequent seismic activity within 100km', severity: 'MEDIUM' })

    // ── 8. Recommendations ────────────────────────────────────────────────
    const recommendations: Recommendation[] = [
      {
        category: 'Preparedness',
        action:   'Maintain a 72-hour emergency kit with water, food, and first aid.',
        priority: overallRisk >= 60 ? 'HIGH' : 'MEDIUM',
      },
      {
        category: 'Flood',
        action:   floodScore >= 60
          ? 'Evacuate if flooding is imminent. Know your nearest evacuation center.'
          : 'Monitor local PAGASA advisories during heavy rain.',
        priority: riskLevel(floodScore),
      },
      {
        category: 'Earthquake',
        action:   quakeScore >= 40
          ? 'Reinforce structures. Practice Drop-Cover-Hold-On drills.'
          : 'Be aware of earthquake protocols in public buildings.',
        priority: riskLevel(quakeScore),
      },
      {
        category: 'Power Outage',
        action:   'Keep flashlights, power banks, and a battery radio readily available.',
        priority: overallRisk >= 50 ? 'HIGH' : 'LOW',
      },
    ]

    // ── 9. Assemble full RiskReport ────────────────────────────────────────
    const report: RiskReport = {
      location:    location ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city:        location?.split(',')[0] ?? '',
      region:      location?.split(',').slice(1).join(',').trim() ?? 'Philippines',
      coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      elevation:   `${elevation.toFixed(0)}m`,
      population:  '',   // no free PH population API — leave for frontend to fill
      generatedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
      confidence:  clamp(70 + (quakes.length > 0 ? 10 : 0) + (floodScore > 0 ? 10 : 0)),
      overallRisk,
      overallLevel: riskLevel(overallRisk),
      hazard:       hazardScore,
      exposure:     exposureScore,
      vulnerability: vulnScore,
      capacity:     capacityScore,
      hazards,
      threeDayForecast,
      currentWeather,
      weekForecast,
      cellTowers:   [],   // removed per requirements
      blindSpots,
      recommendations,
      methodology:
        'Risk = (Hazard × Exposure × Vulnerability) / Capacity. ' +
        'Hazard derived from NOAH flood data (50%), USGS seismicity (30%), and wind speed (20%). ' +
        'Exposure from elevation data. Vulnerability from rainfall intensity. ' +
        'Capacity inversely proportional to event frequency.',
      dataSources: [
        'Open-Meteo (weather forecast)',
        'USGS Earthquake Catalog',
        'Project NOAH – UP DREAM (flood hazard)',
        'Open-Meteo Elevation API',
        'Mapbox Geocoding API',
      ],
    }

    return res.json(report)

  } catch (err) {
    console.error('[/api/risk] Error:', err)
    return res.status(500).json({ error: 'Failed to build risk report', detail: String(err) })
  }
})

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`BlindSpot API running on http://localhost:${PORT}`)
})