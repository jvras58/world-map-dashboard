"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet"
import type { Map as LeafletMap, Layer } from "leaflet"
import type { FeatureCollection, Feature } from "geojson"
import Sidebar from "@/components/sidebar"
import MapLegend from "@/components/map-legend"
import { calculateBounds } from "@/lib/geo-utils"

export default function WorldMapPage() {
  const [mapData, setMapData] = useState<FeatureCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dates, setDates] = useState<string[]>([])
  const [currentDate, setCurrentDate] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(5)
  const [useExampleData, setUseExampleData] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadedData, setUploadedData] = useState<Record<string, any> | null>(null)
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-8.05, -34.88])
  const [sidebarStats, setSidebarStats] = useState({
    totalReviews: 0,
    regionStats: [
      { name: "North Zone", rating: 0 },
      { name: "South Zone", rating: 0 },
      { name: "East Zone", rating: 0 },
      { name: "West Zone", rating: 0 },
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
  const geoJsonLayerRef = useRef<any>(null)
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/geojson")
      .then((response) => response.json())
      .then((data) => {
        console.log("[v0] Neighborhood GeoJSON data loaded successfully")
        setMapData(data as FeatureCollection)

        const bounds = calculateBounds(data)
        console.log("[v0] Calculated bounds:", bounds)

        const padding = 0.01
        setMapBounds([
          [bounds.minLat - padding, bounds.minLng - padding],
          [bounds.maxLat + padding, bounds.maxLng + padding],
        ])
        setMapCenter(bounds.center)

        if (data.features && data.features.length > 0 && data.features[0].properties.timeSeriesData) {
          const allDates = Object.keys(data.features[0].properties.timeSeriesData).sort()
          setDates(allDates)
          setCurrentDate(allDates[0])
        }

        setIsLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error loading GeoJSON data:", error)
        setIsLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!mapData || !currentDate) return

    const dataSource = useExampleData ? null : uploadedData

    let totalReviews = 0
    let totalRating = 0
    let validNeighborhoods = 0

    type ZoneKey = "North Zone" | "South Zone" | "East Zone" | "West Zone"
    const zones: Record<ZoneKey, { total: number; count: number }> = {
      "North Zone": { total: 0, count: 0 },
      "South Zone": { total: 0, count: 0 },
      "East Zone": { total: 0, count: 0 },
      "West Zone": { total: 0, count: 0 },
    }

    const stars = {
      oneStar: 0,
      twoStars: 0,
      threeStars: 0,
      fourStars: 0,
      fiveStars: 0,
    }

    mapData.features.forEach((feature, index) => {
      const props = (feature.properties ?? {}) as Record<string, any>
      const neighborhoodName = props.EBAIRRNOMEOF || props.EBAIRRNOME

      let rating
      if (!useExampleData && dataSource && dataSource[currentDate] && dataSource[currentDate][neighborhoodName]) {
        rating = dataSource[currentDate][neighborhoodName].dailyRating
        totalReviews += 1
      } else {
        const timeSeriesData = props.timeSeriesData || {}
        rating = timeSeriesData[currentDate] || props.rating
        const reviewCount = Math.floor(Math.random() * 1000) + 100
        totalReviews += reviewCount
      }

      if (rating) {
        totalRating += rating
        validNeighborhoods++

        const zoneNames = Object.keys(zones) as ZoneKey[]
        const zoneName = zoneNames[index % zoneNames.length] as ZoneKey
        if (zones[zoneName]) {
          zones[zoneName].total += rating
          zones[zoneName].count++
        }

        if (rating >= 4.5) stars.fiveStars++
        else if (rating >= 3.5) stars.fourStars++
        else if (rating >= 2.5) stars.threeStars++
        else if (rating >= 1.5) stars.twoStars++
        else stars.oneStar++
      }
    })

    const globalAverage = validNeighborhoods > 0 ? totalRating / validNeighborhoods : 0

    const regionStats = (Object.keys(zones) as ZoneKey[]).map((name) => {
      const zone = zones[name]
      const rating = zone.count > 0 ? zone.total / zone.count : 0
      return { name, rating }
    })

    const scaleFactor = Math.ceil(
      totalReviews / (stars.oneStar + stars.twoStars + stars.threeStars + stars.fourStars + stars.fiveStars),
    )

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

  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed)
  }, [])

  const handleToggleExampleData = useCallback((checked: boolean) => {
    setUseExampleData(checked)
    console.log("[v0] Using example data:", checked)
  }, [])

  const handleUploadClick = useCallback(() => {
    setIsUploadDialogOpen(true)
  }, [])

  const handleApplyUploadedData = useCallback((data: Record<string, any>) => {
    console.log("[v0] Applying uploaded data:", Object.keys(data).length, "dates")
    setUploadedData(data)
    setUseExampleData(false)

    if (data) {
      const uploadedDates = Object.keys(data).sort()
      if (uploadedDates.length > 0) {
        setDates(uploadedDates)
        setCurrentDate(uploadedDates[0])
      }
    }

    setIsUploadDialogOpen(false)
  }, [])

  useEffect(() => {
    if (isPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }

      playIntervalRef.current = setInterval(() => {
        setCurrentDate((prevDate) => {
          const currentIndex = dates.indexOf(prevDate)
          const nextIndex = currentIndex + 1 >= dates.length ? 0 : currentIndex + 1
          return dates[nextIndex]
        })
      }, playbackSpeed * 1000)
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, dates, playbackSpeed])

  useEffect(() => {
    if (!mapData || !currentDate) return

    const dataSource = useExampleData ? null : uploadedData

    const updatedData = {
      ...mapData,
      features: mapData.features.map((feature) => {
        const props = (feature.properties ?? {}) as Record<string, any>
        const neighborhoodName = props.EBAIRRNOMEOF || props.EBAIRRNOME

        const timeSeriesData = props.timeSeriesData || {}
        let ratingForDate = timeSeriesData[currentDate] || props.rating
        let highlighted = props.highlighted || false
        let tooltipData = null

        if (!useExampleData && dataSource && dataSource[currentDate] && dataSource[currentDate][neighborhoodName]) {
          const neighborhoodData = dataSource[currentDate][neighborhoodName]
          ratingForDate = neighborhoodData.dailyRating
          highlighted = true
          tooltipData = {
            packageName: neighborhoodData.packageName,
            dailyRating: neighborhoodData.dailyRating,
            totalRating: neighborhoodData.totalRating,
          }
        }

        return {
          ...feature,
          properties: {
            ...props,
            rating: ratingForDate,
            highlighted,
            tooltipData,
          },
        }
      }),
    }

    setMapData(updatedData)
  }, [currentDate, useExampleData, uploadedData])

  const mapStyle = (feature?: Feature) => {
    const props = (feature?.properties ?? {}) as Record<string, any>
    const rating = props.rating || 0
    const highlighted = props.highlighted || false

    let fillColor = "#ef4444"

    if (rating >= 4.7) {
      fillColor = "#22c55e"
    } else if (rating >= 4.3) {
      fillColor = "#10b981"
    } else if (rating >= 4.0) {
      fillColor = "#14b8a6"
    } else if (rating >= 3.7) {
      fillColor = "#06b6d4"
    } else if (rating >= 3.4) {
      fillColor = "#0ea5e9"
    } else if (rating >= 3.0) {
      fillColor = "#eab308"
    } else if (rating >= 2.5) {
      fillColor = "#f59e0b"
    } else if (rating >= 2.0) {
      fillColor = "#f97316"
    } else {
      fillColor = "#ef4444"
    }

    return {
      fillColor: fillColor,
      weight: highlighted ? 2.5 : 1.5,
      opacity: 1,
      color: "#333333",
      fillOpacity: highlighted ? 0.65 : 0.5,
      dashArray: highlighted ? "" : "3",
    }
  }

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const props = (feature?.properties ?? {}) as Record<string, any>
    if (props) {
      const neighborhoodName = props.EBAIRRNOMEOF || props.EBAIRRNOME || "Unknown"
      const rating = props.rating || 0
      const tooltipData = props.tooltipData

      let tooltipContent = `<div class="font-medium">${neighborhoodName}</div>
                           <div>Rating: ${rating.toFixed(3)}/5</div>`

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
          typeof window !== "undefined" &&
          mapBounds && (
            <div className="relative h-full w-full">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                minZoom={11}
                maxZoom={16}
                maxBounds={mapBounds}
                maxBoundsViscosity={1.0}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  className="base-map"
                />

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
                    key={currentDate + (useExampleData ? "-example" : "-custom")}
                  />
                )}
                <ZoomControl position="bottomright" />
              </MapContainer>

              <MapLegend />
            </div>
          )
        )}
      </div>
    </div>
  )
}
