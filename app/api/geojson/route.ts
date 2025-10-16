import { NextResponse } from "next/server"
import neighborhoodsData from "@/data/neighborhoods.json"
import { generateNeighborhoodRatings, generateDateRange } from "@/lib/geo-utils"
import type { FeatureCollection } from "geojson"

export async function GET() {
  try {
    const dates = generateDateRange(30)

    // Tipar explicitamente o JSON importado para evitar erro de compatibilidade
    const neighborhoods = neighborhoodsData as unknown as FeatureCollection

    const neighborhoodsWithRatings = generateNeighborhoodRatings(neighborhoods, dates)

    return NextResponse.json(neighborhoodsWithRatings)
  } catch (error) {
    console.error("Error loading neighborhood GeoJSON:", error)
    return NextResponse.json({ error: "Failed to load GeoJSON data" }, { status: 500 })
  }
}
