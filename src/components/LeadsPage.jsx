import { useMemo } from 'react'
import { Users, Star, Target, Send } from 'lucide-react'
import StatCard from './StatCard.jsx'
import LeadsTable from './LeadsTable.jsx'

const SCORE_LABELS = [
  { label: 'Low intent', min: 0, max: 5 },
  { label: 'Qualified', min: 6, max: 7 },
  { label: 'High intent', min: 8, max: 10 },
]

export default function LeadsPage({ leads, statuses, onStatusChange, role, onLeadUpdate }) {
  const counts = useMemo(() => {
    const found = leads.length
    const qualified = leads.filter((l) => l.score >= 6).length
    const contacted = leads.filter((l) => ['Contacted', 'Interested', 'Client'].includes(statuses[l.id])).length
    const interested = leads.filter((l) => ['Interested', 'Client'].includes(statuses[l.id])).length
    const clients = leads.filter((l) => statuses[l.id] === 'Client').length
    const highIntent = leads.filter((l) => l.score >= 8).length
    return { found, qualified, contacted, interested, clients, highIntent }
  }, [leads, statuses])

  const statusCounts = useMemo(() => {
    const totals = { New: 0, Contacted: 0, Interested: 0, Client: 0, 'Not interested': 0 }
    leads.forEach((lead) => {
      const status = statuses[lead.id] || 'New'
      totals[status] = (totals[status] || 0) + 1
    })
    return totals
  }, [leads, statuses])

  const scoreDistribution = useMemo(() => {
    const totals = SCORE_LABELS.map((bucket) => ({ ...bucket, count: 0 }))
    leads.forEach((lead) => {
      const score = Number(lead.score) || 0
      const bucket = totals.find((item) => score >= item.min && score <= item.max)
      if (bucket) bucket.count += 1
    })
    return totals
  }, [leads])

  const totalLeads = counts.found || 1

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="font-sans font-bold text-3xl">Leads</h1>
          <p className="text-paper/60 mt-2">Review all imported leads, update status, and monitor lead quality.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard icon={Users} label="Leads Found" value={counts.found} delta="Across all imports" />
        <StatCard icon={Star} label="Qualified" value={counts.qualified} delta="Score ≥ 6" />
        <StatCard icon={Target} label="High Intent" value={counts.highIntent} delta="Score ≥ 8" />
        <StatCard icon={Send} label="Contacted" value={counts.contacted} delta="Outreach started" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-4 mb-6">
        <div className="space-y-4">
          <div className="border border-line rounded-xl p-6 bg-blue-900/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-paper/50">Status distribution</p>
                <h2 className="font-semibold text-lg">Current pipeline</h2>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs text-paper/60 mb-1">
                    <span>{status}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-blue-950 overflow-hidden">
                    <div
                      className="h-full bg-signal"
                      style={{ width: `${Math.round((count / totalLeads) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-line rounded-xl p-6 bg-blue-900/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-paper/50">Score breakdown</p>
                <h2 className="font-semibold text-lg">Lead quality</h2>
              </div>
            </div>
            <div className="space-y-4">
              {scoreDistribution.map((bucket) => (
                <div key={bucket.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-paper/60">
                    <span>{bucket.label}</span>
                    <span>{bucket.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-blue-950 overflow-hidden">
                    <div
                      className="h-full bg-good"
                      style={{ width: `${Math.round((bucket.count / totalLeads) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-line rounded-xl p-6 bg-blue-900/30">
          <h2 className="font-semibold text-lg mb-4">Quick actions</h2>
          <div className="grid gap-3">
            <button className="w-full rounded-xl bg-blue-950/50 border border-line px-4 py-4 text-left hover:bg-blue-950 transition-colors">
              <p className="text-sm text-paper/50">Import more leads</p>
              <p className="mt-2 font-medium">Upload current campaign results</p>
            </button>
            <button className="w-full rounded-xl bg-blue-950/50 border border-line px-4 py-4 text-left hover:bg-blue-950 transition-colors">
              <p className="text-sm text-paper/50">Review outreach status</p>
              <p className="mt-2 font-medium">Update contacted and interest stages</p>
            </button>
          </div>
        </div>
      </div>

      <LeadsTable leads={leads} statuses={statuses} onStatusChange={onStatusChange} role={role} onLeadUpdate={onLeadUpdate} />
    </div>
  )
}
