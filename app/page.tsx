"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import Sidebar from "@/components/sidebar"
import MapLegend from "@/components/map-legend"
import TimelineControl from "@/components/timeline-control"
import UploadDialog from "@/components/upload-dialog"

export default function WorldMapPage() {
  const [mapData, setMapData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dates, setDates] = useState<string[]>([])
  const [currentDate, setCurrentDate] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(5) // Default 5 seconds
  const [useExampleData, setUseExampleData] = useState(true) // Default to using example data
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadedData, setUploadedData] = useState(null)
  const [sidebarStats, setSidebarStats] = useState({
    totalReviews: 0,
    regionStats: [
      { name: "Northern Europe", rating: 0 },
      { name: "Western Europe", rating: 0 },
      { name: "Southern Europe", rating: 0 },
      { name: "Eastern Europe", rating: 0 },
    ],
    starDistribution: {
      oneStar: 0,
      twoStars: 0,
      threeStars: 0,
      fourStars: 0,
      fiveStars: 0,
    },
    globalAverageRating: 0,
  })
  const geoJsonLayerRef = useRef(null)
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch GeoJSON data
  useEffect(() => {
    setIsLoading(true)
    fetch("/api/geojson")
      .then((response) => response.json())
      .then((data) => {
        console.log("GeoJSON data loaded successfully")
        setMapData(data)

        // Extract all available dates from the first feature with time series data
        if (data.features && data.features.length > 0 && data.features[0].properties.timeSeriesData) {
          const allDates = Object.keys(data.features[0].properties.timeSeriesData).sort()
          setDates(allDates)
          setCurrentDate(allDates[0]) // Set initial date to the first date
        }

        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error loading GeoJSON data:", error)
        setIsLoading(false)
      })
  }, [])

  // Calculate statistics based on current data
  useEffect(() => {
    if (!mapData || !currentDate) return

    // Determine which data source to use
    const dataSource = useExampleData ? null : uploadedData

    // Initialize counters and accumulators
    let totalReviews = 0
    let totalRating = 0
    let validCountries = 0

    // Region counters
    const regions = {
      "Northern Europe": { total: 0, count: 0 },
      "Western Europe": { total: 0, count: 0 },
      "Southern Europe": { total: 0, count: 0 },
      "Eastern Europe": { total: 0, count: 0 },
    }

    // Star distribution
    const stars = {
      oneStar: 0,
      twoStars: 0,
      threeStars: 0,
      fourStars: 0,
      fiveStars: 0,
    }

    // Define country to region mapping
    const countryToRegion = {
      // Northern Europe
      SE: "Northern Europe",
      NO: "Northern Europe",
      FI: "Northern Europe",
      DK: "Northern Europe",
      IE: "Northern Europe",
      IS: "Northern Europe",
      // Western Europe
      GB: "Western Europe",
      FR: "Western Europe",
      DE: "Western Europe",
      NL: "Western Europe",
      BE: "Western Europe",
      LU: "Western Europe",
      CH: "Western Europe",
      // Southern Europe
      ES: "Southern Europe",
      IT: "Southern Europe",
      PT: "Southern Europe",
      GR: "Southern Europe",
      HR: "Southern Europe",
      MT: "Southern Europe",
      CY: "Southern Europe",
      // Eastern Europe
      PL: "Eastern Europe",
      CZ: "Eastern Europe",
      HU: "Eastern Europe",
      RO: "Eastern Europe",
      BG: "Eastern Europe",
      SK: "Eastern Europe",
      SI: "Eastern Europe",
    }

    // Process each country's data
    mapData.features.forEach((feature) => {
      const countryCode = feature.properties.ISO_A2 || feature.properties.iso_a2
      const region = countryToRegion[countryCode]

      // Get rating based on data source
      let rating
      if (!useExampleData && dataSource && dataSource[currentDate] && dataSource[currentDate][countryCode]) {
        // Use uploaded data
        rating = dataSource[currentDate][countryCode].dailyRating
        totalReviews += 1 // Each country counts as one review in uploaded data
      } else {
        // Use example data
        const timeSeriesData = feature.properties.timeSeriesData || {}
        rating = timeSeriesData[currentDate] || feature.properties.rating

        // Generate a random number of reviews based on rating
        const reviewCount = Math.floor(Math.random() * 10000) + 1000
        totalReviews += reviewCount
      }

      // Add to total rating
      if (rating) {
        totalRating += rating
        validCountries++

        // Add to region stats if applicable
        if (region && regions[region]) {
          regions[region].total += rating
          regions[region].count++
        }

        // Add to star distribution
        if (rating >= 4.5) stars.fiveStars++
        else if (rating >= 3.5) stars.fourStars++
        else if (rating >= 2.5) stars.threeStars++
        else if (rating >= 1.5) stars.twoStars++
        else stars.oneStar++
      }
    })

    // Calculate global average
    const globalAverage = validCountries > 0 ? totalRating / validCountries : 0

    // Calculate region averages
    const regionStats = Object.keys(regions).map((name) => {
      const region = regions[name]
      const rating = region.count > 0 ? region.total / region.count : 0
      return { name, rating }
    })

    // Scale star distribution to make it more realistic
    const scaleFactor = Math.ceil(
      totalReviews / (stars.oneStar + stars.twoStars + stars.threeStars + stars.fourStars + stars.fiveStars),
    )

    // Update sidebar stats
    setSidebarStats({
      totalReviews,
      regionStats,
      starDistribution: {
        oneStar: stars.oneStar * scaleFactor,
        twoStars: stars.twoStars * scaleFactor,
        threeStars: stars.threeStars * scaleFactor,
        fourStars: stars.fourStars * scaleFactor,
        fiveStars: stars.fiveStars * scaleFactor,
      },
      globalAverageRating: globalAverage,
    })
  }, [mapData, currentDate, useExampleData, uploadedData])

  // Handle play/pause toggle
  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  // Handle playback speed change
  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
  }, [])

  // Handle example data toggle
  const handleToggleExampleData = useCallback((checked: boolean) => {
    setUseExampleData(checked)
    // Here you would typically reload data or switch data sources
    console.log("Using example data:", checked)
  }, [])

  // Handle upload button click
  const handleUploadClick = useCallback(() => {
    setIsUploadDialogOpen(true)
  }, [])

  // Handle uploaded data
  const handleApplyUploadedData = useCallback((data) => {
    console.log("Applying uploaded data:", Object.keys(data).length, "dates")
    setUploadedData(data)
    setUseExampleData(false) // Switch to uploaded data

    // Update dates from uploaded data
    if (data) {
      const uploadedDates = Object.keys(data).sort()
      if (uploadedDates.length > 0) {
        setDates(uploadedDates)
        setCurrentDate(uploadedDates[0])
      }
    }

    setIsUploadDialogOpen(false)
  }, [])

  // Auto-advance the timeline when playing
  useEffect(() => {
    if (isPlaying) {
      // Clear any existing interval
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }

      // Set up a new interval
      playIntervalRef.current = setInterval(() => {
        setCurrentDate((prevDate) => {
          const currentIndex = dates.indexOf(prevDate)
          // Loop back to beginning if at the end
          const nextIndex = currentIndex + 1 >= dates.length ? 0 : currentIndex + 1
          return dates[nextIndex]
        })
      }, playbackSpeed * 1000) // Convert seconds to milliseconds
    } else {
      // Clear the interval when paused
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
    }

    // Clean up on unmount
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, dates, playbackSpeed])

  // Update GeoJSON layer when the date changes or data source changes
  useEffect(() => {
    if (!mapData || !currentDate) return

    // Determine which data source to use
    const dataSource = useExampleData ? null : uploadedData

    const updatedData = {
      ...mapData,
      features: mapData.features.map((feature) => {
        const countryCode = feature.properties.ISO_A2 || feature.properties.iso_a2

        // Default to the time series data
        const timeSeriesData = feature.properties.timeSeriesData || {}
        let ratingForDate = timeSeriesData[currentDate] || feature.properties.rating
        let highlighted = feature.properties.highlighted || false
        let tooltipData = null

        // If we have uploaded data and it contains data for this country on the current date
        if (!useExampleData && dataSource && dataSource[currentDate] && dataSource[currentDate][countryCode]) {
          const countryData = dataSource[currentDate][countryCode]
          ratingForDate = countryData.dailyRating
          highlighted = true
          tooltipData = {
            packageName: countryData.packageName,
            dailyRating: countryData.dailyRating,
            totalRating: countryData.totalRating,
          }
        }

        return {
          ...feature,
          properties: {
            ...feature.properties,
            rating: ratingForDate,
            highlighted,
            tooltipData,
          },
        }
      }),
    }

    setMapData(updatedData)
  }, [currentDate, useExampleData, uploadedData])

  const mapStyle = (feature) => {
    // Color based on rating score
    const rating = feature.properties.rating || 0
    const highlighted = feature.properties.highlighted || false

    // More granular color scale for better visualization based on 1-5 rating
    let fillColor = "#ef4444" // red-500 (default/critical)

    if (rating >= 4.7) {
      fillColor = "#22c55e" // green-500 (excellent)
    } else if (rating >= 4.3) {
      fillColor = "#10b981" // emerald-500 (very good)
    } else if (rating >= 4.0) {
      fillColor = "#14b8a6" // teal-500 (good)
    } else if (rating >= 3.7) {
      fillColor = "#06b6d4" // cyan-500 (above average)
    } else if (rating >= 3.4) {
      fillColor = "#0ea5e9" // sky-500 (average)
    } else if (rating >= 3.0) {
      fillColor = "#eab308" // yellow-500 (below average)
    } else if (rating >= 2.5) {
      fillColor = "#f59e0b" // amber-500 (poor)
    } else if (rating >= 2.0) {
      fillColor = "#f97316" // orange-500 (very poor)
    } else {
      fillColor = "#ef4444" // red-500 (critical)
    }

    return {
      fillColor: fillColor,
      weight: highlighted ? 2.5 : 1.5,
      opacity: 1,
      color: "#333333", // Dark border for all countries
      fillOpacity: highlighted ? 0.65 : 0.5, // More transparent overlays
      dashArray: highlighted ? "" : "3", // Solid line for highlighted countries, dashed for others
    }
  }

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const countryName = feature.properties.ADMIN || feature.properties.name || "Unknown"
      const rating = feature.properties.rating || 0
      const tooltipData = feature.properties.tooltipData

      let tooltipContent = `<div class="font-medium">${countryName}</div>
                           <div>Rating: ${rating.toFixed(3)}/5</div>`

      // Add additional tooltip data if available
      if (tooltipData) {
        tooltipContent += `<div class="mt-2 pt-2 border-t border-gray-200">
                          <div>Package: ${tooltipData.packageName}</div>
                          <div>Daily Rating: ${tooltipData.dailyRating.toFixed(3)}/5</div>
                          <div>Total Rating: ${tooltipData.totalRating.toFixed(3)}/5</div>
                        </div>`
      }

      layer.bindTooltip(tooltipContent, { sticky: true })
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        currentDate={currentDate}
        useExampleData={useExampleData}
        onToggleExampleData={handleToggleExampleData}
        onUploadClick={handleUploadClick}
        totalReviews={sidebarStats.totalReviews}
        regionStats={sidebarStats.regionStats}
        starDistribution={sidebarStats.starDistribution}
        globalAverageRating={sidebarStats.globalAverageRating}
      />
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
              <p className="mt-4 text-teal-600 font-medium">Loading map data...</p>
            </div>
          </div>
        ) : (
          typeof window !== "undefined" && (
            <div className="relative h-full w-full">
              <MapContainer
                center={[50, 10]} // Centered on Europe
                zoom={4} // Closer zoom to see European countries better
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                minZoom={1}
              >
                {/* Use a light blue ocean color */}
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  className="base-map"
                />

                {/* Add country labels */}
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  className="label-layer"
                  zIndex={2}
                />

                {mapData && (
                  <GeoJSON
                    data={mapData}
                    style={mapStyle}
                    onEachFeature={onEachFeature}
                    ref={geoJsonLayerRef}
                    key={currentDate + (useExampleData ? "-example" : "-custom")} // Force re-render when date or data source changes
                  />
                )}
                <ZoomControl position="bottomright" />
              </MapContainer>

              {/* Place the legend outside the MapContainer but inside the parent div */}
              <MapLegend />

              {/* Timeline control */}
              {dates.length > 0 && (
                <TimelineControl
                  currentDate={currentDate}
                  onDateChange={setCurrentDate}
                  isPlaying={isPlaying}
                  onPlayToggle={handlePlayToggle}
                  dates={dates}
                  playbackSpeed={playbackSpeed}
                  onSpeedChange={handleSpeedChange}
                />
              )}
            </div>
          )
        )}
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onApply={handleApplyUploadedData}
      />
    </div>
  )
}
