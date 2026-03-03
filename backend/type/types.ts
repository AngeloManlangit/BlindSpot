export interface HazardRow {
  type: string
  score: number
  level: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE'
  keyFactors: string
}

export interface ThreeDayForecast {
  day: number
  date: string
  hazard: string
  riskLevel: string
  summary: string
}

export interface WeatherCondition {
  temperature: string
  description: string
  humidity: string
  windSpeed: string
  visibility: string
}

export interface DayForecast {
  day: string
  condition: string
  temperature: string
  precipitationChance: string
}

export interface CellTower {
  name: string
  distance: string
  signal: string
  operator: string
  location: string
}

export interface BlindSpot {
  area: string
  issue: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface Recommendation {
  category: string
  action: string
  priority: string
}

export interface RiskReport {
  location: string
  city: string
  region: string
  coordinates: string
  elevation: string
  population: string
  generatedAt: string
  confidence: number
  overallRisk: number
  overallLevel: string
  hazard: number
  exposure: number
  vulnerability: number
  capacity: number
  hazards: HazardRow[]
  threeDayForecast: ThreeDayForecast[]
  currentWeather: WeatherCondition
  weekForecast: DayForecast[]
  cellTowers: CellTower[]
  blindSpots: BlindSpot[]
  recommendations: Recommendation[]
  methodology: string
  dataSources: string[]
}
