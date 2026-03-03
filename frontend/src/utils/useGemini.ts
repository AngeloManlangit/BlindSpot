import { ref } from "vue";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useCache } from "./useCache";

export interface WeatherAnalysis {
  vulnerabilityScore: number;
  systemStatus: "Operational" | "Degrading" | "Critical" | "Offline";
  timestamp: string;
  etr: string;
  advisories: {
    work: string;
    commute: string;
    school: string;
  };
  criticalAction: string;
  offlineBrief: string;
  pdfContent: string;
}

// Fallback data for offline / error states
const FALLBACK_ANALYSIS: WeatherAnalysis = {
  vulnerabilityScore: 0,
  systemStatus: "Offline",
  timestamp: new Date().toISOString(),
  etr: "Unavailable — operating offline",
  advisories: {
    work: "No live data. Follow local advisories.",
    commute: "Check road conditions before traveling.",
    school: "Monitor official school announcements.",
  },
  criticalAction: "Ensure devices are charged. Check local radio for updates.",
  offlineBrief:
    "BlindSpot is offline. Last sync data may be stale.\nFollow local emergency channels for real-time updates.",
  pdfContent: "Offline mode — no fresh analysis available.",
};

// Minimum seconds between API calls (cooldown to protect quota)
const COOLDOWN_MS = 10_000; // 10 seconds

export function useGemini() {
  const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const analysis = ref<WeatherAnalysis | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isOffline = ref(false);

  // Cache layer — 10 min TTL for offline persistence
  const cache = useCache<WeatherAnalysis>("weather_analysis", 10 * 60 * 1000);

  // Track last successful API call to enforce cooldown
  let lastFetchTime = 0;

  /**
   * Fetch analysis from Gemini. Respects a 10-second cooldown:
   * if cache data is < 10 s old the cached result is returned
   * immediately without an API call, protecting free-tier quota.
   */
  const fetchWeatherAnalysis = async (
    infraData: object,
    weatherData: object,
    historicalData: string
  ): Promise<WeatherAnalysis> => {
    // --- Cooldown guard: serve cache if last fetch was < 10 s ago ---
    const age = cache.getAge();
    if (age !== null && age < COOLDOWN_MS / 1000) {
      const cached = cache.read();
      if (cached) {
        analysis.value = cached;
        isOffline.value = false;
        return cached;
      }
    }

    loading.value = true;
    error.value = null;

    const prompt = `
      Role: You are the Lead Weather Risk Strategist for BlindSpot.
      Your primary goal is to perform a high-speed risk synthesis to refresh
      the local cache before potential grid failure.

      UNDRR Standard Risk Formula: Risk = (Hazard * Exposure * Vulnerability) / Capacity.

      Core Task:
      Analyze the following real-time data and provide a "Last-Known-State" report.
      This data must be formatted for local persistence so the app can function entirely offline.

      Input Data:
      Infrastructure: ${JSON.stringify(infraData)}
      Current Weather: ${JSON.stringify(weatherData)}
      Historical Recovery Data: ${historicalData}

      Output Requirements (Strict JSON — no markdown, no backticks, ONLY valid JSON):
      {
        "vulnerabilityScore": <0-100 number>,
        "systemStatus": "<Operational | Degrading | Critical | Offline>",
        "timestamp": "<ISO string>",
        "etr": "<predictive restoration window string>",
        "advisories": { "work": "<string>", "commute": "<string>", "school": "<string>" },
        "criticalAction": "<immediate action string>",
        "offlineBrief": "<2-line crisis brief>",
        "pdfContent": "<detailed text for Digital Survival Kit export>"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedJson = responseText.replace(/```json|```/g, "").trim();
      const parsed: WeatherAnalysis = JSON.parse(cleanedJson);

      // Persist to cache & update state
      cache.write(parsed);
      analysis.value = parsed;
      isOffline.value = false;
      lastFetchTime = Date.now();
      loading.value = false;
      return parsed;
    } catch (err: any) {
      console.error("Gemini Synthesis Error:", err);

      // Produce a short, human-readable error instead of the raw API dump
      const raw: string = err.message || "Synthesis failed";
      if (raw.includes("quota") || raw.includes("429")) {
        error.value = "API quota exceeded — wait a minute and retry";
      } else if (raw.includes("API key") || raw.includes("403")) {
        error.value = "Invalid API key — check VITE_GEMINI_API_KEY in .env";
      } else {
        error.value = raw.length > 120 ? raw.slice(0, 120) + "…" : raw;
      }

      // Fallback: serve stale cache (only if it contains real data)
      const cached = cache.read();
      if (cached && cached.systemStatus !== "Offline") {
        analysis.value = cached;
        isOffline.value = true;
        loading.value = false;
        return cached;
      }

      // Ultimate fallback — static offline data
      analysis.value = FALLBACK_ANALYSIS;
      isOffline.value = true;
      loading.value = false;
      return FALLBACK_ANALYSIS;
    }
  };

  /**
   * Load from cache only — no network call. Use on mount for instant UI.
   */
  const loadFromCache = (): WeatherAnalysis | null => {
    const cached = cache.read();
    if (cached) {
      analysis.value = cached;
      isOffline.value = cache.isStale.value;
    }
    return cached;
  };

  /**
   * Wipe cached analysis so the next fetch always hits the API.
   */
  const clearCache = (): void => {
    cache.clear();
    analysis.value = null;
    error.value = null;
    isOffline.value = false;
  };

  return {
    analysis,
    loading,
    error,
    isOffline,
    cacheAge: cache.getAge,
    lastUpdated: cache.lastUpdated,
    fetchWeatherAnalysis,
    loadFromCache,
    clearCache,
  };
}
