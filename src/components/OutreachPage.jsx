import { useMemo } from 'react'
import { Mail, MessageCircle, UserCheck, XCircle } from 'lucide-react'
import StatCard from './StatCard.jsx'

const STATUS_ORDER = ['Contacted', 'Interested', 'Client', 'Not interested']

function statusStyle(status) {
  switch (status) {
    case 'Client':
      return 'bg-good/15 text-good border border-good/30'
    case 'Interested':
      return 'bg-good/10 text-good border border-good/30'
    case 'Contacted':
      return 'bg-signal/10 text-signal border border-signal/30'
    case 'Not interested':
      return 'bg-red-500/10 text-red-300 border border-red-500/30'
    default:
      return 'bg-blue-950/40 text-paper/60 border border-line'
  }
}

function LeadRow({ lead, status, onStatusChange }) {
  return (
    <tr className="border-b border-line last:border-0 hover:bg-blue-950/30">
      <td className="px-6 py-4 align-top">
        <div className="font-medium">{lead.name}</div>
        <div className="text-paper/50 text-xs mt-1">{lead.address || 'No address provided'}</div>
      </td>
      <td className="px-4 py-4 align-top text-paper/60">{lead.phone || '—'}</td>
      <td className="px-4 py-4 align-top text-paper/60">{lead.website ? <a href={lead.website} target="_blank" rel="noreferrer" className="underline hover:text-signal">Visit</a> : '—'}</td>
      <td className="px-4 py-4 align-top text-paper/60">{lead.score}/10</td>
      <td className="px-4 py-4 align-top">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyle(status)}`}>{status}</span>
      </td>
      <td className="px-4 py-4 align-top">
        <select
          value={status}
          onChange={(e) => onStatusChange(lead.id, e.target.value)}
          className="bg-blue-950 border border-line rounded-md px-2.5 py-1 text-xs text-paper/80 focus:outline-none"
        >
          {['New', 'Contacted', 'Interested', 'Client', 'Not interested'].map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </td>
    </tr>
  )
}

export default function OutreachPage({ leads, statuses, onStatusChange }) {
  const outreachLeads = useMemo(
    () => leads.filter((lead) => {
      const status = statuses[lead.id] || 'New'
      return status !== 'New'
    }),
    [leads, statuses]
  )

  const metrics = useMemo(() => {
    const totals = {
      outreachSent: 0,
      responses: 0,
      clients: 0,
      notInterested: 0,
      interested: 0,
    }
    leads.forEach((lead) => {
      const status = statuses[lead.id] || 'New'
      if (status !== 'New') totals.outreachSent += 1
      if (status === 'Interested' || status === 'Client') totals.responses += 1
      if (status === 'Client') totals.clients += 1
      if (status === 'Not interested') totals.notInterested += 1
      if (status === 'Interested') totals.interested += 1
    })
    return totals
  }, [leads, statuses])

  const responseRate = metrics.outreachSent ? Math.round((metrics.responses / metrics.outreachSent) * 100) : 0
  const clientRate = metrics.outreachSent ? Math.round((metrics.clients / metrics.outreachSent) * 100) : 0

  const buckets = useMemo(() => {
    const bucketCounts = STATUS_ORDER.map((status) => ({ status, count: 0 }))
    outreachLeads.forEach((lead) => {
      const status = statuses[lead.id] || 'New'
      const bucket = bucketCounts.find((item) => item.status === status)
      if (bucket) bucket.count += 1
    })
    return bucketCounts
  }, [outreachLeads, statuses])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="font-sans font-bold text-3xl">Outreach</h1>
          <p className="text-paper/60 mt-2">Track outreach progress, response rates, and follow-up status for your current lead pipeline.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard icon={Mail} label="Outreach Sent" value={metrics.outreachSent} delta="Leads contacted" />
        <StatCard icon={MessageCircle} label="Responses" value={metrics.responses} delta={`${responseRate}% response rate`} />
        <StatCard icon={UserCheck} label="Clients" value={metrics.clients} delta={`${clientRate}% conversion`} />
        <StatCard icon={XCircle} label="Not interested" value={metrics.notInterested} delta="No response or declined" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4 mb-6">
        <div className="border border-line rounded-xl p-6 bg-blue-900/30">
          <h2 className="font-semibold text-lg mb-4">Outreach status</h2>
          <div className="space-y-4">
            {buckets.map((bucket) => (
              <div key={bucket.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-paper/60">
                  <span>{bucket.status}</span>
                  <span>{bucket.count}</span>
                </div>
                <div className="h-2 rounded-full bg-blue-950 overflow-hidden">
                  <div className="h-full bg-signal" style={{ width: `${metrics.outreachSent ? Math.round((bucket.count / metrics.outreachSent) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-line rounded-xl p-6 bg-blue-900/30">
          <h2 className="font-semibold text-lg mb-4">How to use this page</h2>
          <ul className="space-y-3 text-sm text-paper/50">
            <li>Update lead status after each message or call.</li>
            <li>Use “Interested” for positive replies and “Client” when a deal closes.</li>
            <li>Track follow-up cadence with the current outreach table below.</li>
          </ul>
        </div>
      </div>

      <div className="border border-line rounded-xl bg-blue-900/30 overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-sans font-semibold text-lg">Outreach Leads</h2>
            <p className="text-paper/50 text-sm mt-1">Only leads with outreach status are shown here.</p>
          </div>
        </div>

        {outreachLeads.length === 0 ? (
          <div className="px-6 pb-10 pt-2 text-center text-paper/40 text-sm">No outreach activity yet. Mark some leads as Contacted or Interested to see them here.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-paper/40 border-t border-b border-line">
                  <th className="px-6 py-3 font-normal">Business</th>
                  <th className="px-4 py-3 font-normal">Phone</th>
                  <th className="px-4 py-3 font-normal">Website</th>
                  <th className="px-4 py-3 font-normal">Score</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                  <th className="px-4 py-3 font-normal">Update</th>
                </tr>
              </thead>
              <tbody>
                {outreachLeads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    status={statuses[lead.id] || 'New'}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
