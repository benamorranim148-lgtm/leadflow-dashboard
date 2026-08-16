import { Home, Users, Star, Send, BarChart3, Settings, Crown } from 'lucide-react'

const BASE_NAV = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: Users, label: 'Leads' },
  { icon: Star, label: 'Qualified Leads' },
  { icon: Send, label: 'Outreach' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Settings, label: 'Settings' },
]

function Logo() {
  return (
    <svg width="56" height="56" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="46" stroke="#F4F7F6" strokeWidth="2" />
      <circle cx="60" cy="60" r="30" stroke="#F4F7F6" strokeWidth="1.5" opacity="0.4" />
      <line x1="60" y1="60" x2="95" y2="30" stroke="#7FB3D5" strokeWidth="1.5" />
      <line x1="60" y1="60" x2="102" y2="72" stroke="#7FB3D5" strokeWidth="1.5" />
      <line x1="60" y1="60" x2="30" y2="95" stroke="#7FB3D5" strokeWidth="1.5" />
      <line x1="60" y1="60" x2="20" y2="35" stroke="#7FB3D5" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="5" fill="#FFB627" />
      <circle cx="95" cy="30" r="5" fill="#F4F7F6" />
      <circle cx="102" cy="72" r="5" fill="#F4F7F6" />
      <circle cx="30" cy="95" r="5" fill="#F4F7F6" />
      <circle cx="20" cy="35" r="5" fill="#F4F7F6" />
    </svg>
  )
}

export default function Sidebar({ active, onNavigate, role }) {
  const NAV_ITEMS = [...BASE_NAV]
  if (role === 'admin') {
    NAV_ITEMS.push({ icon: Crown, label: 'Admin' })
  }
  return (
    <aside className="w-64 shrink-0 border-r border-line bg-blue-950 flex flex-col h-screen sticky top-0">
      <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
        <Logo />
        <p className="mt-3 font-sans font-bold text-xl">leadflow.tn</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, label }) => {
          const isActive = active === label
          return (
            <button
              key={label}
              onClick={() => onNavigate?.(label)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-800/60 text-signal font-medium'
                  : 'text-paper/65 hover:bg-blue-900/60 hover:text-paper'
              }`}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-3 mt-4 px-1">
          <div className="h-9 w-9 rounded-full bg-blue-800 flex items-center justify-center font-semibold text-sm">
            L
          </div>
          <div className="text-xs leading-tight">
            <p className="font-medium">LeadFlow Agency</p>
            <p className="text-paper/50">hello@leadflow.tn</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
