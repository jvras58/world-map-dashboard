import type { FeatureCollection, Feature } from "geojson"

export interface Bounds {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
  center: [number, number]
}

/**
 * Calculate the bounding box from a GeoJSON FeatureCollection
 */
export function calculateBounds(geojson: FeatureCollection): Bounds {
  let minLat = Number.POSITIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY
  let minLng = Number.POSITIVE_INFINITY
  let maxLng = Number.NEGATIVE_INFINITY

  function processCoordinates(coords: any) {
    if (typeof coords[0] === "number") {
      // This is a coordinate pair [lng, lat]
      const [lng, lat] = coords
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    } else {
      // This is an array of coordinates
      coords.forEach(processCoordinates)
    }
  }

  // Type guard: verifica se o objeto possui 'coordinates'
  function geometryHasCoordinates(geom: any): geom is { coordinates: any } {
    return geom && typeof geom === "object" && "coordinates" in geom
  }

  // Extrai recursivamente arrays de coordenadas de diferentes tipos de geometria,
  // incluindo GeometryCollection
  function extractCoordinatesFromGeometry(geom: any): any[] {
    if (!geom) return []
    if (geometryHasCoordinates(geom)) {
      return [geom.coordinates]
    }
    if (geom.type === "GeometryCollection" && Array.isArray(geom.geometries)) {
      return geom.geometries.flatMap((g: any) => extractCoordinatesFromGeometry(g))
    }
    // Outros casos (defensivo)
    return []
  }

  geojson.features.forEach((feature: Feature) => {
    const geom: any = (feature as any).geometry
    if (!geom) return

    const coordsArrays = extractCoordinatesFromGeometry(geom)
    coordsArrays.forEach(processCoordinates)
  })

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    // center como [lng, lat]
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
  }
}

/**
 * Generate random ratings for neighborhoods with time series data
 */
export function generateNeighborhoodRatings(geojson: FeatureCollection, dates: string[]) {
  return {
    ...geojson,
    features: geojson.features.map((feature: Feature) => {
      const props = (feature.properties ?? {}) as Record<string, any>
      const timeSeriesData: Record<string, number> = {}

      // Generate ratings for each date with some variation
      const baseRating = 3.0 + Math.random() * 2.0 // Base rating between 3.0 and 5.0

      dates.forEach((date, index) => {
        // Add some temporal variation
        const variation = Math.sin(index / 3) * 0.3 + (Math.random() * 0.4 - 0.2)
        timeSeriesData[date] = Math.max(1.0, Math.min(5.0, baseRating + variation))
      })

      return {
        ...feature,
        properties: {
          ...props,
          rating: timeSeriesData[dates[0]], // Initial rating
          timeSeriesData,
        },
      }
    }),
  }
}

/**
 * Generate date range for the past 30 days
 */
export function generateDateRange(days = 30): string[] {
  const dates: string[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split("T")[0])
  }

  return dates
}
