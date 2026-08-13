import { useMemo } from 'react'
import { Star, Target, Users } from 'lucide-react'
import StatCard from './StatCard.jsx'
import LeadsTable from './LeadsTable.jsx'

export default function QualifiedLeadsPage({ leads, statuses, onStatusChange }) {
  const qualifiedLeads = useMemo(
    () => leads.filter((lead) => Number(lead.score) >= 8),
    [leads]
  )

  const counts = useMemo(() => {
    const contacted = qualifiedLeads.filter((lead) => ['Contacted', 'Interested', 'Client'].includes(statuses[lead.id])).length
    const interested = qualifiedLeads.filter((lead) => ['Interested', 'Client'].includes(statuses[lead.id])).length
    const clients = qualifiedLeads.filter((lead) => statuses[lead.id] === 'Client').length
    return {
      total: qualifiedLeads.length,
      contacted,
      interested,
      clients,
    }
  }, [qualifiedLeads, statuses])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="font-sans font-bold text-3xl">Qualified Leads</h1>
          <p className="text-paper/60 mt-2">A fast shortlist of the highest-scoring leads so you can act on the best prospects first.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard icon={Users} label="Shortlist size" value={counts.total} delta="High-scoring leads only" />
        <StatCard icon={Star} label="Contacted" value={counts.contacted} delta="Already reached out" />
        <StatCard icon={Target} label="Interested" value={counts.interested} delta="Positive replies" />
        <StatCard icon={Star} label="Clients" value={counts.clients} delta="Closed deals" />
      </div>

      <div className="border border-line rounded-xl bg-blue-900/30 overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-sans font-semibold text-lg">High-priority leads</h2>
            <p className="text-paper/50 text-sm mt-1">Only leads with score 8-10 are shown here.</p>
          </div>
        </div>

        <LeadsTable leads={qualifiedLeads} statuses={statuses} onStatusChange={onStatusChange} />
      </div>
    </div>
  )
}
