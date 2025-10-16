import { NextResponse } from "next/server"

// Generate a month of daily data (April 2025)
const generateMonthData = (baseRating: number) => {
  const days = 30 // April has 30 days
  const result = {}

  // Start with the base rating
  let currentRating = baseRating

  for (let day = 1; day <= days; day++) {
    // Add some random variation day to day (between -0.3 and +0.3)
    // But ensure there's some continuity by limiting daily changes
    const change = (Math.random() * 0.6 - 0.3).toFixed(3)

    // Ensure the rating stays within reasonable bounds (1-5)
    currentRating = Math.max(1, Math.min(5, currentRating + Number.parseFloat(change)))

    // Store the rating for this day with 3 decimal places
    result[`2025-04-${day.toString().padStart(2, "0")}`] = Number.parseFloat(currentRating.toFixed(3))
  }

  return result
}

export async function GET() {
  // European countries to highlight with their ISO codes
  const europeanCountries = {
    // Western Europe
    GB: { name: "United Kingdom", baseRating: 4.2 },
    FR: { name: "France", baseRating: 4.1 },
    DE: { name: "Germany", baseRating: 4.3 },
    NL: { name: "Netherlands", baseRating: 4.4 },
    BE: { name: "Belgium", baseRating: 4.2 },
    // Northern Europe
    SE: { name: "Sweden", baseRating: 4.6 },
    NO: { name: "Norway", baseRating: 4.7 },
    FI: { name: "Finland", baseRating: 4.6 },
    DK: { name: "Denmark", baseRating: 4.5 },
    IE: { name: "Ireland", baseRating: 4.3 },
    // Southern Europe
    ES: { name: "Spain", baseRating: 4.0 },
    IT: { name: "Italy", baseRating: 3.9 },
    PT: { name: "Portugal", baseRating: 4.0 },
    GR: { name: "Greece", baseRating: 3.7 },
    HR: { name: "Croatia", baseRating: 3.9 },
    // Eastern Europe
    PL: { name: "Poland", baseRating: 3.8 },
    CZ: { name: "Czech Republic", baseRating: 4.0 },
    HU: { name: "Hungary", baseRating: 3.7 },
    RO: { name: "Romania", baseRating: 3.6 },
    BG: { name: "Bulgaria", baseRating: 3.5 },
    // Other major countries
    US: { name: "United States", baseRating: 4.3 },
    CA: { name: "Canada", baseRating: 4.5 },
    MX: { name: "Mexico", baseRating: 4.0 },
    BR: { name: "Brazil", baseRating: 4.0 },
    CN: { name: "China", baseRating: 3.8 },
    JP: { name: "Japan", baseRating: 4.5 },
    AU: { name: "Australia", baseRating: 4.7 },
    IN: { name: "India", baseRating: 4.1 },
    ZA: { name: "South Africa", baseRating: 3.7 },
    RU: { name: "Russia", baseRating: 3.6 },
    AF: { name: "Afghanistan", baseRating: 3.3 },
  }

  // Regional base ratings for non-highlighted countries
  const regionBaseRatings = {
    Africa: { min: 2.5, max: 3.8 },
    Americas: { min: 3.0, max: 4.3 },
    Asia: { min: 2.8, max: 4.1 },
    Europe: { min: 3.3, max: 4.5 },
    Oceania: { min: 3.5, max: 4.6 },
  }

  // Fetch the complete GeoJSON from a public source
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
    )
    const worldData = await response.json()

    // Add rating data to each country
    const countriesWithData = {
      type: "FeatureCollection",
      features: worldData.features.map((country) => {
        // Get country code and region from properties
        const countryCode = country.properties.ISO_A2 || country.properties.iso_a2
        const region = country.properties.REGION_UN || country.properties.CONTINENT || "Unknown"

        let baseRating = 3.8 // Default rating
        let highlighted = false

        // Check if this is a country we want to highlight
        if (countryCode && europeanCountries[countryCode]) {
          baseRating = europeanCountries[countryCode].baseRating
          highlighted = true
        } else {
          // Generate a base rating based on region
          let regionRating = regionBaseRatings.Americas // default

          if (region.includes("Africa")) {
            regionRating = regionBaseRatings.Africa
          } else if (region.includes("Asia")) {
            regionRating = regionBaseRatings.Asia
          } else if (region.includes("Europe")) {
            regionRating = regionBaseRatings.Europe
          } else if (region.includes("Oceania")) {
            regionRating = regionBaseRatings.Oceania
          }

          // Generate random rating within the region's range
          baseRating = Number.parseFloat(
            (Math.random() * (regionRating.max - regionRating.min) + regionRating.min).toFixed(3),
          )
        }

        // Generate time-series data for the entire month
        const timeSeriesData = generateMonthData(baseRating)

        return {
          ...country,
          properties: {
            ...country.properties,
            // Use the first day's data as the default rating
            rating: timeSeriesData["2025-04-01"],
            highlighted,
            timeSeriesData,
          },
        }
      }),
    }

    return NextResponse.json(countriesWithData)
  } catch (error) {
    console.error("Error fetching GeoJSON:", error)
    return NextResponse.json({ error: "Failed to load GeoJSON data" }, { status: 500 })
  }
}
