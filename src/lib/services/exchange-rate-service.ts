/**
 * Exchange Rate Service
 * Fetches and caches PEN/USD exchange rate
 */

// Cache configuration
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_RATE = 3.75; // Fallback rate if API fails

interface CachedRate {
  rate: number;
  timestamp: number;
}

let cachedRate: CachedRate | null = null;

/**
 * Fetches the current PEN to USD exchange rate
 * Uses exchangerate-api.com free tier
 */
async function fetchExchangeRate(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const penRate = data.rates?.PEN;
    
    if (!penRate || typeof penRate !== "number") {
      throw new Error("Invalid rate data received");
    }
    
    return penRate;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    return DEFAULT_RATE;
  }
}

/**
 * Gets the current PEN/USD exchange rate with caching
 * @returns Exchange rate (how many PEN equals 1 USD)
 */
export async function getExchangeRate(): Promise<number> {
  const now = Date.now();
  
  // Return cached rate if valid
  if (cachedRate && now - cachedRate.timestamp < CACHE_DURATION_MS) {
    return cachedRate.rate;
  }
  
  // Fetch new rate
  const rate = await fetchExchangeRate();
  cachedRate = { rate, timestamp: now };
  
  return rate;
}

/**
 * Converts PEN amount to USD
 * @param penAmount Amount in Peruvian Soles
 * @returns Amount in US Dollars
 */
export async function penToUsd(penAmount: number): Promise<number> {
  const rate = await getExchangeRate();
  return penAmount / rate;
}

/**
 * Converts USD amount to PEN
 * @param usdAmount Amount in US Dollars
 * @returns Amount in Peruvian Soles
 */
export async function usdToPen(usdAmount: number): Promise<number> {
  const rate = await getExchangeRate();
  return usdAmount * rate;
}

/**
 * Formats amount based on currency
 * @param amount The amount to format
 * @param currency Currency code ('PEN' or 'USD')
 * @returns Formatted string with symbol
 */
export function formatCurrencyAmount(
  amount: number,
  currency: "PEN" | "USD"
): string {
  const symbol = currency === "USD" ? "$" : "S/.";
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Type export
export type Currency = "PEN" | "USD";
