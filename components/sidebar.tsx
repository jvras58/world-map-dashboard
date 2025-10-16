"use client"

import { useState } from "react"
import { Upload, Download } from "lucide-react"

interface RegionStats {
  name: string
  rating: number
}

interface StarDistribution {
  oneStar: number
  twoStars: number
  threeStars: number
  fourStars: number
  fiveStars: number
}

interface SidebarProps {
  currentDate?: string
  useExampleData?: boolean
  onToggleExampleData?: (checked: boolean) => void
  onUploadClick?: () => void
  totalReviews?: number
  regionStats?: RegionStats[]
  starDistribution?: StarDistribution
  globalAverageRating?: number
}

export default function Sidebar({
  currentDate,
  useExampleData = true,
  onToggleExampleData = () => {},
  onUploadClick = () => {},
  totalReviews = 0,
  regionStats = [],
  starDistribution = { oneStar: 0, twoStars: 0, threeStars: 0, fourStars: 0, fiveStars: 0 },
  globalAverageRating = 0,
}: SidebarProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  // Format the date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Calculate percentages for star distribution
  const totalStars =
    starDistribution.oneStar +
    starDistribution.twoStars +
    starDistribution.threeStars +
    starDistribution.fourStars +
    starDistribution.fiveStars

  const getPercentage = (count: number) => {
    if (totalStars === 0) return 0
    return (count / totalStars) * 100
  }

  // Generate and download example CSV data
  const handleDownloadExampleData = () => {
    setIsDownloading(true)

    // Generate CSV header
    let csvContent = "Date,Package Name,Country,Daily Average Rating,Total Average Rating\n"

    // Generate example data for 30 days and 10 countries
    const countries = ["US", "GB", "DE", "FR", "ES", "IT", "JP", "CN", "IN", "BR"]
    const packageName = "com.example.app"

    // Generate data for April 2025
    for (let day = 1; day <= 30; day++) {
      const date = `2025-04-${day.toString().padStart(2, "0")}`

      // Generate data for each country
      countries.forEach((country) => {
        // Generate a random rating between 1 and 5 with 4 decimal places
        const dailyRating = (1 + Math.random() * 4).toFixed(4)
        // Keep total average rating as 0 as requested
        const totalRating = "0"

        // Add the line to CSV content
        csvContent += `${date},${packageName},${country},${dailyRating},${totalRating}\n`
      })
    }

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "example-ratings.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Reset downloading state after a short delay
    setTimeout(() => {
      setIsDownloading(false)
    }, 1000)
  }

  // Get text color based on rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4.3) return "text-teal-600"
    if (rating >= 3.7) return "text-teal-600"
    if (rating >= 3.0) return "text-yellow-600"
    return "text-orange-600"
  }

  return (
    <div className="w-72 bg-white/70 backdrop-blur-md p-6 z-10 shadow-lg h-full flex flex-col font-light border-r border-gray-200/50">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2">Global Ratings</h1>
        <p className="text-gray-500 text-sm">Real-time app rating metrics</p>
        {currentDate && (
          <p className="text-teal-600 font-medium text-sm mt-2">Showing data for: {formatDate(currentDate)}</p>
        )}
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-500">Total Reviews</p>
        <p className="text-4xl font-light">{formatNumber(totalReviews)}</p>
      </div>

      <div className="mb-6 border-t pt-4">
        <p className="text-sm font-medium mb-2">European Region Highlights</p>
        <div className="space-y-2">
          {regionStats.map((region, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{region.name}</span>
              <span className={`font-medium ${getRatingColor(region.rating)}`}>{region.rating.toFixed(1)}/5</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 flex-grow">
        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">5 Stars</p>
            <p className="text-sm font-medium">{formatNumber(starDistribution.fiveStars)}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${getPercentage(starDistribution.fiveStars)}%` }}
            ></div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">4 Stars</p>
            <p className="text-sm font-medium">{formatNumber(starDistribution.fourStars)}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full"
              style={{ width: `${getPercentage(starDistribution.fourStars)}%` }}
            ></div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">3 Stars</p>
            <p className="text-sm font-medium">{formatNumber(starDistribution.threeStars)}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full"
              style={{ width: `${getPercentage(starDistribution.threeStars)}%` }}
            ></div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">2 Stars</p>
            <p className="text-sm font-medium">{formatNumber(starDistribution.twoStars)}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: `${getPercentage(starDistribution.twoStars)}%` }}
            ></div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">1 Star</p>
            <p className="text-sm font-medium">{formatNumber(starDistribution.oneStar)}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{ width: `${getPercentage(starDistribution.oneStar)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Global Average Rating</p>
          <p className={`text-xl font-light ${getRatingColor(globalAverageRating)}`}>
            {globalAverageRating.toFixed(2)}/5
          </p>
        </div>
      </div>

      {/* Example data checkbox */}
      <div className="mt-6 pt-4 border-t">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useExampleData}
            onChange={(e) => onToggleExampleData(e.target.checked)}
            className="rounded text-teal-500 focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">Use example data</span>
        </label>
      </div>

      {/* Download example data button */}
      <div className="mt-3">
        <button
          onClick={handleDownloadExampleData}
          disabled={isDownloading}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors border border-gray-300"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full mr-2"></div>
              Downloading...
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download Example CSV</span>
            </>
          )}
        </button>
      </div>

      {/* Upload button at the bottom */}
      <div className="mt-3">
        <button
          onClick={onUploadClick}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <Upload size={18} />
          <span>Upload Data</span>
        </button>
        <p className="mt-4 text-xs text-gray-400 text-center">* Data updated: April 18, 2025</p>
      </div>
    </div>
  )
}
