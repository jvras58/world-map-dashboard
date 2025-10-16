export default function MapTooltip({ content, position }) {
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
