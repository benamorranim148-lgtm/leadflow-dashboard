import { Users, Star, Send, MessageCircle, UserCheck } from 'lucide-react'

export default function Pipeline({ counts }) {
  const STAGES = [
    { icon: Users, value: counts.found, label: 'Found' },
    { icon: Star, value: counts.qualified, label: 'Qualified' },
    { icon: Send, value: counts.contacted, label: 'Contacted' },
    { icon: MessageCircle, value: counts.interested, label: 'Interested' },
    { icon: UserCheck, value: counts.clients, label: 'Clients', highlight: true },
  ]

  return (
    <div className="border border-line rounded-xl p-6 bg-blue-900/30 h-full">
      <h2 className="font-sans font-semibold text-lg mb-6">Lead Pipeline</h2>
      <div className="flex items-center justify-between">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex items-center">
            <div className="flex flex-col items-center text-center">
              <div
                className={`h-14 w-14 rounded-full flex items-center justify-center border ${
                  stage.highlight
                    ? 'border-signal bg-signal/10'
                    : 'border-line bg-blue-800/50'
                }`}
              >
                <stage.icon
                  size={20}
                  strokeWidth={1.8}
                  className={stage.highlight ? 'text-signal' : 'text-paper/80'}
                />
              </div>
              <p className="font-sans font-bold text-2xl mt-2">{stage.value}</p>
              <p className="text-xs text-paper/50">{stage.label}</p>
            </div>
            {i < STAGES.length - 1 && (
              <div className="w-8 md:w-12 h-px bg-line mx-1 md:mx-2 self-start mt-7" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
