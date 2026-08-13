export default function StatCard({ icon: Icon, label, value, delta }) {
  return (
    <div className="border border-line rounded-xl p-5 bg-blue-900/30 flex-1 min-w-[220px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-blue-800/60 flex items-center justify-center">
          <Icon size={18} className="text-paper/80" strokeWidth={1.8} />
        </div>
        <p className="text-paper/60 text-sm">{label}</p>
      </div>
      <p className="font-sans font-bold text-3xl mb-1">{value}</p>
      <p className="text-xs text-paper/50">
        <span className="text-signal font-medium">↑ {delta}</span> vs last 7 days
      </p>
    </div>
  )
}
