interface MapTooltipProps {
  content: React.ReactNode
  position: { x: number; y: number } | null
}

export default function MapTooltip({ content, position }: MapTooltipProps) {
  if (!position) return null

  return (
    <div
      className="absolute bg-white p-2 rounded-md shadow-lg z-50 text-sm"
      style={{
        left: position.x + 10,
        top: position.y - 30,
      }}
    >
      {content}
    </div>
  )
}
