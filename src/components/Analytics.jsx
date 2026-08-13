import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { ArrowUpRight, Layers, TrendingUp, Repeat } from 'lucide-react'
import StatCard from './StatCard.jsx'

const CHART_VIEWS = ['Weekly', 'Monthly']

function formatPercent(value) {
  return `${value}%`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-blue-950 border border-line rounded-md px-3 py-2 text-xs">
      <p className="text-paper/50 mb-1">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="text-paper">
          <span className="font-semibold">{item.value}</span> {item.name}
        </p>
      ))}
    </div>
  )
}

function summarizeCounts(leads, statuses) {
  const totals = {
    total: leads.length,
    clients: 0,
    outreach: 0,
    responses: 0,
    qualified: 0,
    contactable: 0,
  }

  leads.forEach((lead) => {
    const status = statuses[lead.id] || 'New'
    if (status === 'Client') totals.clients += 1
    if (status !== 'New') totals.outreach += 1
    if (status === 'Interested' || status === 'Client') totals.responses += 1
    if (lead.score >= 6) totals.qualified += 1
    if (['Contacted', 'Interested', 'Client'].includes(status)) totals.contactable += 1
  })

  return totals
}

function buildPerformance(items, key) {
  const groups = {}

  items.forEach((item) => {
    const value = item[key] || item.query || item.category
    if (!value) return
    groups[value] = (groups[value] || 0) + 1
  })

  return Object.entries(groups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }))
}

function getWeekKey(dateString) {
  const date = new Date(dateString)
  const day = date.getUTCDay() || 7
  const isoThursday = new Date(date)
  isoThursday.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(isoThursday.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil((((isoThursday - yearStart) / 86400000) + 1) / 7)
  return `${isoThursday.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`
}

function getChartData(importHistory, view) {
  const buckets = {}

  importHistory.forEach((point) => {
    const sourceDate = point.date || point.day
    const date = new Date(sourceDate)
    if (Number.isNaN(date.getTime())) return

    const label = view === 'Monthly'
      ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : getWeekKey(sourceDate)

    buckets[label] = (buckets[label] || 0) + point.leads
  })

  return Object.entries(buckets)
    .map(([label, leads]) => ({ label, leads }))
    .sort((a, b) => (a.label > b.label ? 1 : -1))
}

export default function Analytics({ leads, statuses, importHistory }) {
  const [view, setView] = useState('Weekly')
  const totals = useMemo(() => summarizeCounts(leads, statuses), [leads, statuses])
  const performance = useMemo(
    () => ({
      categories: buildPerformance(leads, 'category'),
      searches: buildPerformance(leads, 'query'),
    }),
    [leads]
  )
  const chartData = useMemo(() => getChartData(importHistory, view), [importHistory, view])

  const conversionRate = totals.total ? Math.round((totals.clients / totals.total) * 100) : 0
  const responseRate = totals.outreach ? Math.round((totals.responses / totals.outreach) * 100) : 0
  const outreachRate = totals.total ? Math.round((totals.outreach / totals.total) * 100) : 0

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard icon={ArrowUpRight} label="Conversion Rate" value={formatPercent(conversionRate)} delta="Leads → clients" />
        <StatCard icon={Repeat} label="Outreach Rate" value={formatPercent(outreachRate)} delta="Leads contacted" />
        <StatCard icon={TrendingUp} label="Response Rate" value={formatPercent(responseRate)} delta="Outreach responses" />
        <StatCard icon={Layers} label="Qualified Leads" value={totals.qualified} delta="Score ≥ 6" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4 mb-6">
        <div className="border border-line rounded-xl p-6 bg-blue-900/30">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-sans font-semibold text-lg">Performance Trend</h2>
              <p className="text-paper/50 text-sm mt-1">Weekly and monthly lead import volume.</p>
            </div>
            <div className="flex gap-2">
              {CHART_VIEWS.map((option) => (
                <button
                  key={option}
                  onClick={() => setView(option)}
                  className={`text-xs rounded-full px-3 py-1.5 transition-colors ${
                    view === option ? 'bg-signal text-blue-950' : 'bg-blue-950/30 text-paper/70 hover:bg-blue-900/70'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(245,250,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(244,247,246,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(244,247,246,0.4)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="leads" stroke="#FFB627" strokeWidth={2.5} dot={{ fill: '#FFB627', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-paper/40 text-sm text-center px-6">
              Import at least one leads.csv file to start tracking weekly and monthly trends.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="border border-line rounded-xl p-6 bg-blue-900/30">
            <h3 className="font-sans font-semibold text-base mb-4">Top Searches</h3>
            {performance.searches.length > 0 ? (
              <div className="space-y-3">
                {performance.searches.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-line p-3">
                    <span className="text-sm text-paper">{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-paper/50 text-sm">No search/category metadata found yet. Add `query` or `category` fields to your import.</p>
            )}
          </div>

          <div className="border border-line rounded-xl p-6 bg-blue-900/30">
            <h3 className="font-sans font-semibold text-base mb-4">Top Categories</h3>
            {performance.categories.length > 0 ? (
              <div className="space-y-3">
                {performance.categories.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-line p-3">
                    <span className="text-sm text-paper">{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-paper/50 text-sm">No category metadata found yet. Add `category` values to imported rows.</p>
            )}
          </div>
        </div>
      </div>

      <div className="border border-line rounded-xl p-6 bg-blue-900/30">
        <h2 className="font-sans font-semibold text-lg mb-4">Outreach and response</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-line p-4 bg-blue-950/40">
            <p className="text-sm text-paper/50">Outreach sent</p>
            <p className="mt-2 font-semibold text-xl">{totals.outreach}</p>
          </div>
          <div className="rounded-2xl border border-line p-4 bg-blue-950/40">
            <p className="text-sm text-paper/50">Responses</p>
            <p className="mt-2 font-semibold text-xl">{totals.responses}</p>
          </div>
          <div className="rounded-2xl border border-line p-4 bg-blue-950/40">
            <p className="text-sm text-paper/50">Response efficiency</p>
            <p className="mt-2 font-semibold text-xl">{formatPercent(responseRate)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
