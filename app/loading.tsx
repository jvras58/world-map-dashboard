export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-teal-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
        <p className="mt-4 text-teal-600 font-medium">Loading map data...</p>
      </div>
    </div>
  )
}
