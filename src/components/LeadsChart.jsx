import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-blue-950 border border-line rounded-md px-3 py-2 text-xs">
      <p className="text-paper/50 mb-0.5">{label}</p>
      <p className="text-signal font-semibold">{payload[0].value} leads</p>
    </div>
  )
}

export default function LeadsChart({ data }) {
  const hasData = data && data.length > 0

  return (
    <div className="border border-line rounded-xl p-6 bg-blue-900/30 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-sans font-semibold text-lg">Leads Over Time</h2>
        <button className="text-xs border border-line rounded-md px-3 py-1.5 text-paper/60 hover:border-signal/40 transition-colors">
          Per import
        </button>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB627" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FFB627" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(245,250,255,0.06)" vertical={false} />
            <XAxis dataKey="day" stroke="rgba(244,247,246,0.4)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(244,247,246,0.4)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#FFB627"
              strokeWidth={2.5}
              dot={{ fill: '#FFB627', r: 4 }}
              activeDot={{ r: 6 }}
              fill="url(#leadFill)"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-paper/40 text-sm text-center px-6">
          Import a leads.csv to start tracking leads found over time — each import adds a point to this chart.
        </div>
      )}
    </div>
  )
}
