import { useState, useEffect, useMemo } from 'react'
import Papa from 'papaparse'
import { Users, Star, Target, Send, LogOut } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import StatCard from './components/StatCard.jsx'
import Pipeline from './components/Pipeline.jsx'
import LeadsChart from './components/LeadsChart.jsx'
import LeadsTable from './components/LeadsTable.jsx'
import LoginPage from './LoginPage.jsx'
import AdminClientsPage from './AdminClientsPage.jsx'
import { useAuth } from './AuthContext.jsx'
import {
  subscribeLeads,
  createLeadsForClient,
  updateLeadStatus,
  subscribeUsers,
  signOutUser,
} from './firebase.js'

export default function App() {
  const { user, profile, loading } = useAuth()

  // ---- Auth gate: not logged in yet, or still checking ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-paper/50 text-sm">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={() => {}} />
  }

  const isAdmin = profile?.role === 'admin'

  return isAdmin ? <AdminApp profile={profile} /> : <ClientApp profile={profile} />
}

// ===========================================================
// ADMIN VIEW — sees and manages every client's leads
// ===========================================================
function AdminApp({ profile }) {
  const [active, setActive] = useState('Dashboard')
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [importHistory, setImportHistory] = useState([])

  useEffect(() => {
    const unsub = subscribeLeads((items) => setLeads(items)) // no clientId = all leads
    return () => unsub && unsub()
  }, [])

  useEffect(() => {
    const unsub = subscribeUsers((items) => {
      const clientUsers = items.filter((u) => u.role === 'client')
      setClients(clientUsers)
      if (!selectedClientId && clientUsers.length > 0) {
        setSelectedClientId(clientUsers[0].id)
      }
    })
    return () => unsub && unsub()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const statuses = useMemo(() => {
    const map = {}
    leads.forEach((l) => { map[l.id] = l.status || 'New' })
    return map
  }, [leads])

  async function handleImport(file) {
    if (!selectedClientId) {
      alert('Select a client first — imported leads need to be assigned to someone.')
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsed = results.data.map((row) => ({
          name: row.name || 'Unnamed',
          address: row.address || '',
          website: row.website || '',
          phone: row.phone || '',
          score: parseInt(row.score, 10) || 0,
          reason: row.reason || '',
          status: 'New',
        }))

        await createLeadsForClient(selectedClientId, parsed)

        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        setImportHistory((prev) => {
          const existing = prev.find((p) => p.day === today)
          if (existing) {
            return prev.map((p) => (p.day === today ? { ...p, leads: p.leads + parsed.length } : p))
          }
          return [...prev, { day: today, leads: parsed.length }]
        })
      },
    })
  }

  async function handleStatusChange(id, status) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l))) // optimistic
    await updateLeadStatus(id, status)
  }

  const counts = useMemo(() => {
    const found = leads.length
    const qualified = leads.filter((l) => l.score >= 6).length
    const contacted = leads.filter((l) => ['Contacted', 'Interested', 'Client'].includes(l.status)).length
    const interested = leads.filter((l) => ['Interested', 'Client'].includes(l.status)).length
    const highIntent = leads.filter((l) => l.score >= 8).length
    return { found, qualified, contacted, interested, highIntent }
  }, [leads])

  function pct(count, total) {
    if (!total) return '0%'
    return `${Math.round((count / total) * 100)}%`
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={setActive} extraItems={[{ label: 'Clients' }]} />

      <div className="flex-1 px-8 py-8 max-w-[1400px]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-paper/50">Signed in as admin — {profile?.email}</p>
          <button
            onClick={() => signOutUser()}
            className="flex items-center gap-1.5 text-xs text-paper/60 hover:text-paper border border-line rounded-md px-3 py-1.5"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>

        <Header onImport={handleImport} />

        {active === 'Dashboard' && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <label className="text-xs text-paper/50">Assign new imports to:</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-blue-950 border border-line rounded-md px-2 py-1 text-xs"
              >
                {clients.length === 0 && <option value="">No clients yet — add one in "Clients"</option>}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.businessName || c.email}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <StatCard icon={Users} label="Leads Found" value={counts.found} delta={pct(counts.found, Math.max(counts.found, 1))} />
              <StatCard icon={Star} label="Qualified" value={counts.qualified} delta={pct(counts.qualified, counts.found)} />
              <StatCard icon={Target} label="High-Intent" value={counts.highIntent} delta={pct(counts.highIntent, counts.found)} />
              <StatCard icon={Send} label="Contacted" value={counts.contacted} delta={pct(counts.contacted, counts.found)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <Pipeline counts={counts} />
              <LeadsChart data={importHistory} />
            </div>

            <LeadsTable leads={leads} statuses={statuses} onStatusChange={handleStatusChange} />
          </>
        )}

        {active === 'Clients' && <AdminClientsPage />}

        {active !== 'Dashboard' && active !== 'Clients' && (
          <div className="rounded-3xl border border-line bg-blue-900/30 p-10 text-center text-paper/60">
            <p className="text-xl font-semibold text-paper">{active} is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ===========================================================
// CLIENT VIEW — sees only their own leads, status editable only
// ===========================================================
function ClientApp({ profile }) {
  const [leads, setLeads] = useState([])

  useEffect(() => {
    if (!profile?.uid) return
    const unsub = subscribeLeads((items) => setLeads(items), profile.uid)
    return () => unsub && unsub()
  }, [profile?.uid])

  const statuses = useMemo(() => {
    const map = {}
    leads.forEach((l) => { map[l.id] = l.status || 'New' })
    return map
  }, [leads])

  async function handleStatusChange(id, status) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l))) // optimistic
    await updateLeadStatus(id, status)
  }

  const counts = useMemo(() => {
    const found = leads.length
    const qualified = leads.filter((l) => l.score >= 6).length
    const contacted = leads.filter((l) => ['Contacted', 'Interested', 'Client'].includes(l.status)).length
    const interested = leads.filter((l) => ['Interested', 'Client'].includes(l.status)).length
    const highIntent = leads.filter((l) => l.score >= 8).length
    return { found, qualified, contacted, interested, highIntent }
  }, [leads])

  function pct(count, total) {
    if (!total) return '0%'
    return `${Math.round((count / total) * 100)}%`
  }

  return (
    <div className="min-h-screen px-8 py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans font-bold text-2xl">Your Leads</h1>
          <p className="text-paper/50 text-sm mt-1">{profile?.businessName || profile?.email}</p>
        </div>
        <button
          onClick={() => signOutUser()}
          className="flex items-center gap-1.5 text-xs text-paper/60 hover:text-paper border border-line rounded-md px-3 py-1.5"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard icon={Users} label="Leads Found" value={counts.found} delta={pct(counts.found, Math.max(counts.found, 1))} />
        <StatCard icon={Star} label="Qualified" value={counts.qualified} delta={pct(counts.qualified, counts.found)} />
        <StatCard icon={Target} label="High-Intent" value={counts.highIntent} delta={pct(counts.highIntent, counts.found)} />
        <StatCard icon={Send} label="Contacted" value={counts.contacted} delta={pct(counts.contacted, counts.found)} />
      </div>

      <div className="mb-6">
        <Pipeline counts={counts} />
      </div>

      <LeadsTable leads={leads} statuses={statuses} onStatusChange={handleStatusChange} readOnly={false} />
    </div>
  )
}
