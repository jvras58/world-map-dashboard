"use client"
import { Play, Pause, Clock } from "lucide-react"
import { useState, useEffect } from "react"

interface TimelineControlProps {
  currentDate: string
  onDateChange: (date: string) => void
  isPlaying: boolean
  onPlayToggle: () => void
  dates: string[]
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
}

export default function TimelineControl({
  currentDate,
  onDateChange,
  isPlaying,
  onPlayToggle,
  dates,
  playbackSpeed,
  onSpeedChange,
}: TimelineControlProps) {
  // Find the index of the current date in the dates array
  const currentIndex = dates.indexOf(currentDate)
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false)

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleSpeedChange = (speed: number) => {
    onSpeedChange(speed)
    setShowSpeedDropdown(false)
  }

  // Update the slider styles to fix the vertical alignment of the handler
  const sliderStyles = `
.timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #14b8a6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  margin-top: -5px; /* This helps align the thumb vertically with the track */
}

.timeline-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #14b8a6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.timeline-slider::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 4px;
}

.timeline-slider::-moz-range-track {
  height: 8px;
  border-radius: 4px;
}
`

  // Add the styles to the document
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement("style")
    styleElement.innerHTML = sliderStyles

    // Append to head
    document.head.appendChild(styleElement)

    // Clean up
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  return (
    <div className="absolute top-4 right-5 bg-white/70 backdrop-blur-md p-3 rounded-md shadow-lg z-[1000] border border-gray-200/50 w-[60%] max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Global Satisfaction Timeline</h3>
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-teal-600">{formatDate(currentDate)}</div>
          <div className="relative">
            <button
              onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-2 py-1 text-xs"
            >
              <Clock size={14} className="mr-1" />
              {playbackSpeed}s
            </button>

            {showSpeedDropdown && (
              <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-10">
                <button
                  onClick={() => handleSpeedChange(1)}
                  className={`block w-full text-left px-4 py-1 text-sm hover:bg-gray-100 ${playbackSpeed === 1 ? "bg-gray-100" : ""}`}
                >
                  1 second
                </button>
                <button
                  onClick={() => handleSpeedChange(5)}
                  className={`block w-full text-left px-4 py-1 text-sm hover:bg-gray-100 ${playbackSpeed === 5 ? "bg-gray-100" : ""}`}
                >
                  5 seconds
                </button>
                <button
                  onClick={() => handleSpeedChange(10)}
                  className={`block w-full text-left px-4 py-1 text-sm hover:bg-gray-100 ${playbackSpeed === 10 ? "bg-gray-100" : ""}`}
                >
                  10 seconds
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onPlayToggle}
            className="flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white rounded-full w-8 h-8"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>

      <div className="relative flex flex-col w-full">
        <input
          type="range"
          min="0"
          max={dates.length - 1}
          value={currentIndex}
          onChange={(e) => onDateChange(dates[Number.parseInt(e.target.value)])}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer timeline-slider"
          style={{
            background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(currentIndex / (dates.length - 1)) * 100}%, #e5e7eb ${(currentIndex / (dates.length - 1)) * 100}%, #e5e7eb 100%)`,
          }}
        />

        <div className="flex justify-between w-full text-xs text-gray-500 mt-2">
          <div>{formatDate(dates[0])}</div>
          <div>{formatDate(dates[dates.length - 1])}</div>
        </div>
      </div>
    </div>
  )
}
