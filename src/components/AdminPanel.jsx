import { useRef } from 'react'
import { Upload, Trash2 } from 'lucide-react'

export default function AdminPanel({ settings = {}, onApprove, onDecline, onImport, onClearLeads, statusLog = [] }) {
  const fileRef = useRef(null)

  function handleFile(e) {
    const f = e.target.files?.[0]
    if (f && onImport) onImport(f)
    e.target.value = ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans font-bold text-3xl">Admin</h1>
          <p className="text-paper/60 mt-2">Approve or decline client requests and manage imported leads.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <div className="rounded-3xl border border-line bg-blue-900/30 p-6">
          <h2 className="font-semibold text-lg mb-3">Pending request</h2>
          {settings.accessRequested ? (
            <div className="space-y-3">
              <p className="text-sm text-paper/70">A client has requested dashboard access.</p>
              <div className="flex gap-3">
                <button onClick={onApprove} className="rounded-2xl bg-signal px-4 py-2 text-sm font-semibold text-blue-950">Approve</button>
                <button onClick={onDecline} className="rounded-2xl border border-line px-4 py-2 text-sm text-paper">Decline</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-paper/60">No pending requests.</p>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-blue-900/30 p-6">
          <h2 className="font-semibold text-lg mb-3">Import / Clear leads</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-signal text-blue-950 font-medium rounded-lg px-4 py-2 text-sm">
              <Upload size={14} /> Import leads.csv
            </button>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />

            <button onClick={onClearLeads} className="rounded-2xl border border-line px-4 py-2 text-sm text-paper">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-blue-900/30 p-6">
        <h2 className="font-semibold text-lg mb-3">Recent status changes</h2>
        {statusLog.length === 0 ? (
          <p className="text-sm text-paper/60">No recent changes.</p>
        ) : (
          <div className="space-y-3">
            {statusLog.slice(0, 20).map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-line p-3 bg-blue-950">
                <div className="flex items-center justify-between text-sm text-paper/70 mb-1">
                  <span>{new Date(entry.changedAt).toLocaleString()}</span>
                  <span className="text-xs">{entry.changedBy}</span>
                </div>
                <p className="font-semibold text-paper">{entry.leadName}</p>
                <p className="text-sm text-paper/60">{entry.previous} → {entry.next}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
