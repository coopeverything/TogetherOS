// apps/api/src/modules/geo/services/NominatimService.ts
// OpenStreetMap Nominatim Geocoding Service

/**
 * Geocoded location result
 */
export interface GeocodedLocation {
  city: string
  state: string
  country: string
  neighborhood?: string
  latitude: number
  longitude: number
}

/**
 * Nominatim API response structure
 */
interface NominatimResponse {
  lat: string
  lon: string
  address: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    neighbourhood?: string
    suburb?: string
    county?: string
  }
}

/**
 * OpenStreetMap Nominatim geocoding service
 * Free tier: 1 request per second
 * Rate-limited to comply with usage policy
 */
export class NominatimService {
  private lastRequestTime = 0
  private readonly MIN_INTERVAL_MS = 1000 // 1 second for free tier
  private readonly BASE_URL = 'https://nominatim.openstreetmap.org'
  private readonly USER_AGENT = 'TogetherOS/1.0'

  /**
   * Geocode a US ZIP code to city, state, and coordinates
   */
  async geocodeZipCode(zipCode: string): Promise<GeocodedLocation | null> {
    // Validate ZIP code format (US only for now)
    if (!this.isValidUSZip(zipCode)) {
      console.warn(`Invalid US ZIP code format: ${zipCode}`)
      return null
    }

    // Apply rate limiting
    await this.rateLimit()

    try {
      const url = `${this.BASE_URL}/search?` +
        `postalcode=${encodeURIComponent(zipCode)}&` +
        `country=US&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=1`

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      })

      if (!response.ok) {
        console.error(`Nominatim API error: ${response.status} ${response.statusText}`)
        return null
      }

      const data = (await response.json()) as NominatimResponse[]

      if (!data || data.length === 0) {
        console.warn(`No geocoding results for ZIP code: ${zipCode}`)
        return null
      }

      const result = data[0]
      const address = result.address

      // Extract city (try multiple fields)
      const city = address.city || address.town || address.village || address.county
      if (!city) {
        console.warn(`No city found for ZIP code: ${zipCode}`)
        return null
      }

      // Extract neighborhood
      const neighborhood = address.neighbourhood || address.suburb

      return {
        city,
        state: address.state || '',
        country: address.country || 'United States',
        neighborhood,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  /**
   * Validate US ZIP code format (5 digits or 5+4 format)
   */
  private isValidUSZip(zipCode: string): boolean {
    return /^\d{5}(-\d{4})?$/.test(zipCode)
  }

  /**
   * Rate limiting to comply with Nominatim usage policy (1 req/sec)
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime

    if (elapsed < this.MIN_INTERVAL_MS) {
      const waitTime = this.MIN_INTERVAL_MS - elapsed
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
  }
}

// Singleton instance
export const nominatimService = new NominatimService()
