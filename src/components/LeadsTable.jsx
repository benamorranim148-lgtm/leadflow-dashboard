import { useState, useMemo } from 'react'
import { Search, Globe, MoreVertical } from 'lucide-react'

export const STATUS_OPTIONS = ['New', 'Contacted', 'Interested', 'Client', 'Not interested']

const STATUS_STYLES = {
  New: 'bg-blue-800 text-paper/80',
  Contacted: 'bg-signal/15 text-signal border border-signal/30',
  Interested: 'bg-good/15 text-good border border-good/30',
  Client: 'bg-good/25 text-good border border-good/40',
  'Not interested': 'bg-red-500/10 text-red-300 border border-red-500/30',
}

function ScoreBadge({ score }) {
  const color = score >= 8 ? 'text-signal border-signal/40' : score >= 6 ? 'text-paper/70 border-line' : 'text-paper/40 border-line'
  return (
    <span className={`inline-block font-mono text-xs border rounded-md px-2 py-0.5 ${color}`}>
      {score}/10
    </span>
  )
}

export default function LeadsTable({ leads, statuses, onStatusChange, role, onLeadUpdate, readOnly = false }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = leads
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((l) => l.name.toLowerCase().includes(q))
    }
    return [...result].sort((a, b) => b.score - a.score)
  }, [leads, search])

  return (
    <div className="border border-line rounded-xl bg-blue-900/30 overflow-hidden">
      <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
        <h2 className="font-sans font-semibold text-lg">Recent Leads</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="bg-blue-950 border border-line rounded-md pl-8 pr-3 py-2 text-xs w-44 focus:outline-none focus:border-signal/40"
          />
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="px-6 pb-10 pt-2 text-center text-paper/40 text-sm">
          No leads yet — click "Import leads.csv" above to load results from your agent.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-paper/40 border-t border-b border-line">
                <th className="px-6 py-3 font-normal">Business</th>
                <th className="px-4 py-3 font-normal">Reason</th>
                <th className="px-4 py-3 font-normal">Score</th>
                <th className="px-4 py-3 font-normal">Website</th>
                <th className="px-4 py-3 font-normal">Phone</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-line last:border-0 hover:bg-blue-950/30">
                  <td className="px-6 py-4 align-top">
                    <p className="font-medium">{lead.name}</p>
                    {lead.address && <p className="text-paper/40 text-xs mt-0.5">{lead.address}</p>}
                  </td>
                  <td className="px-4 py-4 align-top text-paper/60 max-w-xs">{lead.reason}</td>
                  <td className="px-4 py-4 align-top"><ScoreBadge score={lead.score} /></td>
                  <td className="px-4 py-4 align-top">
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noreferrer">
                        <Globe size={15} className="text-paper/50 hover:text-signal" />
                      </a>
                    ) : (
                      <span className="text-paper/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-paper/60">
                    {role === 'admin' && !readOnly ? (
                      <input
                        type="text"
                        value={lead.phone || ''}
                        placeholder="Enter contact"
                        onChange={(e) => onLeadUpdate?.(lead.id, { phone: e.target.value })}
                        className="w-full rounded-xl border border-line bg-blue-950 px-3 py-2 text-xs text-paper placeholder:text-paper/40 focus:outline-none focus:border-signal/40"
                      />
                    ) : (
                      lead.phone || '—'
                    )}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <select
                      value={statuses[lead.id] || 'New'}
                      onChange={(e) => onStatusChange(lead.id, e.target.value)}
                      disabled={readOnly}
                      className={`text-xs rounded-md px-2.5 py-1 focus:outline-none ${STATUS_STYLES[statuses[lead.id] || 'New']}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-blue-900 text-paper">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <button className="text-paper/40 hover:text-paper" disabled={readOnly}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
