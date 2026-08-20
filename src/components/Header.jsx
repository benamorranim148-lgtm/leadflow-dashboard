import { Calendar, Bell, Upload, CheckCircle2, AlertTriangle, Circle } from 'lucide-react'
import { useRef, useState } from 'react'

function NotificationItem({ notification, onRead }) {
  const Icon = notification.type === 'success' ? CheckCircle2 : notification.type === 'warning' ? AlertTriangle : Circle
  return (
    <button
      onClick={() => onRead(notification.id)}
      className={`w-full text-left rounded-2xl p-4 transition ${notification.read ? 'bg-blue-950/70' : 'bg-blue-900/70 hover:bg-blue-900/90'}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-1 text-signal" size={18} />
        <div>
          <p className="font-semibold text-sm text-paper">{notification.title}</p>
          <p className="mt-1 text-xs text-paper/70 leading-snug">{notification.body}</p>
          <p className="mt-2 text-[11px] text-paper/50">{new Date(notification.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </button>
  )
}

export default function Header({ dateRange = 'Live data', onImport, onClearLeads, onExport, notifications = [], unreadCount = 0, onMarkRead, onMarkAllRead, role, clients = [], selectedClientId, onSelectClient }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const fileInputRef = useRef(null)
  const [open, setOpen] = useState(false)

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file && onImport) onImport(file)
    e.target.value = '' // allow re-importing the same file name again later
  }

  return (
    <header className="relative flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 className="font-sans font-bold text-2xl flex items-center gap-2">
          {greeting}, LeadFlow Agency <span>👋</span>
        </h1>
        <p className="text-paper/50 text-sm mt-1">Here's what's happening with your leads.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onClearLeads}
          className="rounded-2xl border border-line px-4 py-2.5 text-sm text-paper hover:border-signal hover:text-paper transition-colors"
        >
          Clear leads
        </button>
        {role === 'admin' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedClientId || ''}
              onChange={(e) => onSelectClient?.(e.target.value)}
              className="rounded-md bg-blue-950 border border-line px-3 py-2 text-sm"
            >
              <option value="">Assign to client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.businessName || c.email}</option>
              ))}
            </select>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-signal text-blue-950 font-medium rounded-lg px-4 py-2.5 text-sm hover:bg-signal/90 transition-colors"
            >
              <Upload size={16} />
              Import leads.csv
            </button>
          </div>
        )}
        {role !== 'admin' && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-signal text-blue-950 font-medium rounded-lg px-4 py-2.5 text-sm hover:bg-signal/90 transition-colors"
          >
            <Upload size={16} />
            Import leads.csv
          </button>
        )}
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />

        <button
          onClick={() => onExport?.()}
          className="rounded-2xl border border-line px-4 py-2.5 text-sm text-paper hover:border-signal hover:text-paper transition-colors"
        >
          Export CSV
        </button>

        <button className="flex items-center gap-2 border border-line rounded-lg px-4 py-2.5 text-sm hover:border-signal/40 transition-colors">
          <Calendar size={16} className="text-paper/60" />
          {dateRange}
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="relative border border-line rounded-lg p-2.5 hover:border-signal/40 transition-colors"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 min-w-[10px] items-center justify-center rounded-full bg-signal px-1 text-[10px] font-semibold text-blue-950">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 z-20 mt-3 w-[320px] rounded-3xl border border-line bg-blue-950 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div>
                  <p className="font-semibold text-sm text-paper">Notifications</p>
                  <p className="text-xs text-paper/50">{unreadCount} unread</p>
                </div>
                <button
                  onClick={() => {
                    onMarkAllRead?.()
                  }}
                  className="text-xs font-medium text-signal hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto p-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="rounded-2xl bg-blue-900/70 p-4 text-center text-sm text-paper/60">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => onMarkRead?.(notification.id)}
                      className={`w-full rounded-2xl p-4 text-left transition ${notification.read ? 'bg-blue-950/70' : 'bg-blue-900/80 hover:bg-blue-900/95'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-signal">
                          {notification.type === 'success' ? <CheckCircle2 size={18} /> : notification.type === 'warning' ? <AlertTriangle size={18} /> : <Circle size={10} />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-paper">{notification.title}</p>
                          <p className="mt-1 text-xs text-paper/70 leading-snug">{notification.body}</p>
                          <p className="mt-2 text-[11px] text-paper/50">{new Date(notification.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
