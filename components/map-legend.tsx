export default function MapLegend() {
  return (
    <div className="absolute bottom-8 left-5 bg-white/70 backdrop-blur-md p-4 rounded-md shadow-lg z-[1000] border border-gray-200/50">
      <h3 className="text-sm font-semibold mb-3">App Rating</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-sm bg-green-500 shadow-sm"></div>
          <span className="text-xs font-medium">Excellent (4.7-5.0)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-sm bg-emerald-500 shadow-sm"></div>
          <span className="text-xs font-medium">Very Good (4.3-4.6)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-sm bg-teal-500 shadow-sm"></div>
          <span className="text-xs font-medium">Good (4.0-4.2)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-sm bg-cyan-500 shadow-sm"></div>
          <span className="text-xs font-medium">Above Average (3.7-3.9)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-sm bg-sky-500 shadow-sm"></div>
          <span className="text-xs font-medium">Average (3.4-3.6)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-sm bg-yellow-500 shadow-sm"></div>
          <span className="text-xs font-medium">Below Average (3.0-3.3)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-sm bg-amber-500 shadow-sm"></div>
          <span className="text-xs font-medium">Poor (2.5-2.9)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-sm bg-orange-500 shadow-sm"></div>
          <span className="text-xs font-medium">Very Poor (2.0-2.4)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-sm bg-red-500 shadow-sm"></div>
          <span className="text-xs font-medium">Critical (1.0-1.9)</span>
        </div>
      </div>
    </div>
  )
}
