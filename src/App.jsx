import { useState, useEffect, useMemo } from 'react'
import Papa from 'papaparse'
import { Users, Star, Target, Send } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import StatCard from './components/StatCard.jsx'
import Pipeline from './components/Pipeline.jsx'
import LeadsChart from './components/LeadsChart.jsx'
import LeadsTable from './components/LeadsTable.jsx'
import Analytics from './components/Analytics.jsx'
import LeadsPage from './components/LeadsPage.jsx'
import OutreachPage from './components/OutreachPage.jsx'
import QualifiedLeadsPage from './components/QualifiedLeadsPage.jsx'
import SettingsPage from './components/SettingsPage.jsx'

const LEADS_KEY = 'leadflow_leads'
const STATUSES_KEY = 'leadflow_statuses'
const HISTORY_KEY = 'leadflow_import_history'
const NOTIFICATIONS_KEY = 'leadflow_notifications'
const STATUS_LOG_KEY = 'leadflow_status_log'
const ROLE_KEY = 'leadflow_role'

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [leads, setLeads] = useState([])
  const [statuses, setStatuses] = useState({})
  const [importHistory, setImportHistory] = useState([]) // [{ day: 'Aug 7', leads: 12 }, ...]
  const [settings, setSettings] = useState({})
  const [notifications, setNotifications] = useState([])
  const [role, setRole] = useState('admin')
  const [statusChangeLog, setStatusChangeLog] = useState([])

  const clientDashboardEnabled = Boolean(settings.dashboardAccess)
  const clientRequestedAccess = Boolean(settings.accessRequested)

  const notificationPreferences = useMemo(
    () => ({
      productUpdates: true,
      leadAlerts: true,
      weeklySummary: false,
      ...(settings.notifications || {}),
    }),
    [settings]
  )

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  )

  function addNotification({ title, body, type = 'info' }) {
    const note = {
      id: `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      body,
      type,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [note, ...prev])
  }

  function requestDashboardAccess() {
    setSettings((prev) => ({
      ...prev,
      accessRequested: true,
    }))
    addNotification({
      title: 'Client access requested',
      body: 'A client has requested dashboard access. Review purchase status and import leads to approve.',
      type: 'warning',
    })

    try {
      const message = encodeURIComponent("Bonjour, je souhaite avoir accès à mon dashboard LeadFlow.")
      // Open WhatsApp chat (replace number with your agency number)
      const waNumber = '54125423'
      const waUrl = `https://wa.me/${waNumber}?text=${message}`
      window.open(waUrl, '_blank')

      // Also open an email client as a fallback / complementary channel
      const mailTo = 'support@leadflow.tn'
      const subject = encodeURIComponent('Demandé: accès au dashboard LeadFlow')
      const mailUrl = `mailto:${mailTo}?subject=${subject}&body=${message}`
      window.open(mailUrl, '_blank')
    } catch (e) {
      // ignore errors from popup blockers
      console.warn('Could not open external contact links', e)
    }
  }

  function markNotificationRead(id) {
    setNotifications((prev) => prev.map((note) => (note.id === id ? { ...note, read: true } : note)))
  }

  function markAllNotificationsRead() {
    setNotifications((prev) => prev.map((note) => ({ ...note, read: true })))
  }

  function approveDashboardAccess() {
    setSettings((prev) => ({
      ...prev,
      dashboardAccess: true,
      accessRequested: false,
    }))
    addNotification({
      title: 'Dashboard access approved',
      body: 'Admin approved the client and dashboard access is now enabled.',
      type: 'success',
    })
  }

  function declineDashboardAccess() {
    setSettings((prev) => ({
      ...prev,
      dashboardAccess: false,
      accessRequested: false,
    }))
    addNotification({
      title: 'Dashboard access declined',
      body: 'Admin declined the client request for dashboard access.',
      type: 'warning',
    })
  }

  // load persisted state on first render
  useEffect(() => {
    try {
      const savedLeads = localStorage.getItem(LEADS_KEY)
      const savedStatuses = localStorage.getItem(STATUSES_KEY)
      const savedHistory = localStorage.getItem(HISTORY_KEY)
      const savedStatusLog = localStorage.getItem(STATUS_LOG_KEY)
      const savedSettings = localStorage.getItem('leadflow_settings')
      const savedNotifications = localStorage.getItem(NOTIFICATIONS_KEY)
      const savedRole = localStorage.getItem(ROLE_KEY)
      if (savedLeads) setLeads(JSON.parse(savedLeads))
      if (savedStatuses) setStatuses(JSON.parse(savedStatuses))
      if (savedHistory) setImportHistory(JSON.parse(savedHistory))
      if (savedStatusLog) setStatusChangeLog(JSON.parse(savedStatusLog))
      if (savedSettings) setSettings(JSON.parse(savedSettings))
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
      if (savedRole) setRole(savedRole)
    } catch (e) {
      console.error('Could not load saved dashboard data', e)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads))
  }, [leads])

  useEffect(() => {
    localStorage.setItem(STATUSES_KEY, JSON.stringify(statuses))
  }, [statuses])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(importHistory))
  }, [importHistory])

  useEffect(() => {
    localStorage.setItem(STATUS_LOG_KEY, JSON.stringify(statusChangeLog))
  }, [statusChangeLog])

  useEffect(() => {
    localStorage.setItem('leadflow_settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem(ROLE_KEY, role)
  }, [role])

  function clearLeads() {
    setLeads([])
    setStatuses({})
    setImportHistory([])
    addNotification({
      title: 'Leads cleared',
      body: 'Old CSV leads have been removed. You can now import a new file.',
      type: 'info',
    })
  }

  function handleImport(file) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row, i) => ({
          id: `${row.name || 'lead'}-${Date.now()}-${i}`,
          name: row.name || 'Unnamed',
          address: row.address || '',
          website: row.website || '',
          phone: row.phone || '',
          score: parseInt(row.score, 10) || 0,
          reason: row.reason || '',
        }))

        // append new leads to existing list (don't overwrite previous imports)
        setLeads((prev) => [...prev, ...parsed])

        // record this import in the chart history
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        setImportHistory((prev) => {
          const existing = prev.find((p) => p.day === today)
          if (existing) {
            return prev.map((p) => (p.day === today ? { ...p, leads: p.leads + parsed.length } : p))
          }
          return [...prev, { day: today, leads: parsed.length }]
        })

        if (notificationPreferences.leadAlerts && parsed.length > 0) {
          addNotification({
            title: 'New leads imported',
            body: `${parsed.length} new lead${parsed.length === 1 ? '' : 's'} were added to your pipeline.`,
          })
        }

        if (settings.accessRequested) {
          setSettings((prev) => ({
            ...prev,
            dashboardAccess: true,
            accessRequested: false,
          }))
          addNotification({
            title: 'Dashboard access granted',
            body: 'Leads have been imported and the client now has dashboard access.',
            type: 'success',
          })
        }
      },
    })
  }

  function updateStatus(id, status) {
    setStatuses((prev) => {
      const previousStatus = prev[id]
      if (previousStatus === status) return prev

      const next = { ...prev, [id]: status }
      setStatusChangeLog((prevLog) => [
        {
          id: `status-log-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          leadId: id,
          leadName: leads.find((item) => item.id === id)?.name || 'Unknown lead',
          previous: previousStatus || 'New',
          next: status,
          changedAt: new Date().toISOString(),
          changedBy: role === 'client' ? 'Client' : 'Admin',
        },
        ...prevLog,
      ])

      if (notificationPreferences.leadAlerts) {
        const lead = leads.find((item) => item.id === id)
        const label = lead?.name || 'A lead'
        addNotification({
          title: 'Lead status updated',
          body: `${label} is now marked as ${status}.`,
          type: status === 'Client' ? 'success' : 'info',
        })
      }
      return next
    })
  }

  function updateLead(id, updates) {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead)))
  }

  const counts = useMemo(() => {
    const found = leads.length
    const qualified = leads.filter((l) => l.score >= 6).length
    const contacted = leads.filter((l) => statuses[l.id] === 'Contacted' || statuses[l.id] === 'Interested' || statuses[l.id] === 'Client').length
    const interested = leads.filter((l) => statuses[l.id] === 'Interested' || statuses[l.id] === 'Client').length
    const clients = leads.filter((l) => statuses[l.id] === 'Client').length
    const highIntent = leads.filter((l) => l.score >= 8).length
    return { found, qualified, contacted, interested, clients, highIntent }
  }, [leads, statuses])

  const recentClientChanges = useMemo(
    () => statusChangeLog.filter((entry) => entry.changedBy === 'Client').slice(0, 6),
    [statusChangeLog]
  )

  function pct(count, total) {
    if (!total) return '0%'
    return `${Math.round((count / total) * 100)}%`
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={setActive} />

      <div className="flex-1 px-8 py-8 max-w-[1400px]">
        <Header
          onImport={handleImport}
          onClearLeads={clearLeads}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markNotificationRead}
          onMarkAllRead={markAllNotificationsRead}
          role={role}
          onRoleChange={setRole}
        />

        {role === 'admin' && clientRequestedAccess && (
          <div className="mb-6 rounded-3xl border border-signal/80 bg-signal/10 p-5 text-paper">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-paper">Client dashboard access requested</p>
                <p className="mt-1 text-sm text-paper/70">A client has asked for access. Import leads and approve the request to unlock the dashboard.</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={approveDashboardAccess}
                  className="rounded-2xl bg-signal px-4 py-3 text-sm font-semibold text-blue-950 hover:bg-signal/90 transition-colors"
                >
                  Approve access
                </button>
                <button
                  type="button"
                  onClick={declineDashboardAccess}
                  className="rounded-2xl border border-line px-4 py-3 text-sm text-paper hover:border-red-400 hover:text-red-300 transition-colors"
                >
                  Decline access
                </button>
              </div>
            </div>
          </div>
        )}

        {role === 'admin' && recentClientChanges.length > 0 && (
          <div className="mb-6 rounded-3xl border border-line bg-blue-900/30 p-5 text-paper">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-lg">Recent client status updates</p>
                <p className="text-sm text-paper/60">See what the client changed most recently.</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentClientChanges.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-line bg-blue-950 p-4">
                  <div className="flex items-center justify-between gap-4 text-sm text-paper/70 mb-2">
                    <span>{new Date(entry.changedAt).toLocaleString()}</span>
                    <span className="rounded-full border border-signal/40 bg-signal/10 px-2 py-1 text-xs text-signal">{entry.changedBy}</span>
                  </div>
                  <p className="font-semibold text-paper">{entry.leadName}</p>
                  <p className="text-sm text-paper/60">Status: {entry.previous} → {entry.next}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 'Dashboard' && (
          role === 'client' && !clientDashboardEnabled ? (
            <div className="rounded-3xl border border-line bg-blue-900/30 p-10 text-center text-paper/70">
              <p className="text-2xl font-semibold text-paper mb-4">Dashboard access is locked</p>
              <p className="max-w-xl mx-auto text-sm leading-7">A client can see the dashboard page but cannot view content until access is granted by an admin after verifying purchase and importing leads.</p>
              <div className="mt-8 inline-flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <button
                  type="button"
                  onClick={requestDashboardAccess}
                  className="rounded-2xl bg-signal px-5 py-3 text-sm font-semibold text-blue-950 hover:bg-signal/90 transition-colors"
                >
                  Request access
                </button>
              </div>
              {clientRequestedAccess && (
                <p className="mt-5 text-sm text-paper/60">Access request sent. An admin must verify purchase and import leads to approve dashboard access.</p>
              )}
            </div>
          ) : (
            <>
              {(settings.businessLocation || settings.businessContact) && (
                <div className="rounded-3xl border border-line bg-blue-900/30 p-6 mb-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {settings.businessLocation && (
                      <div className="space-y-2 rounded-2xl bg-blue-950 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-paper/50">Location</p>
                        <p className="text-base font-semibold text-paper">{settings.businessLocation}</p>
                      </div>
                    )}
                    {settings.businessContact && (
                      <div className="space-y-2 rounded-2xl bg-blue-950 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-paper/50">Contact</p>
                        <p className="text-base font-semibold text-paper">{settings.businessContact}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

              <LeadsTable leads={leads} statuses={statuses} onStatusChange={updateStatus} />
            </>
          )
        )}

        {active === 'Leads' && (
          <LeadsPage leads={leads} statuses={statuses} onStatusChange={updateStatus} role={role} onLeadUpdate={updateLead} />
        )}

        {active === 'Outreach' && (
          <OutreachPage leads={leads} statuses={statuses} onStatusChange={updateStatus} />
        )}

        {active === 'Qualified Leads' && (
          <QualifiedLeadsPage leads={leads} statuses={statuses} onStatusChange={updateStatus} />
        )}

        {active === 'Analytics' && (
          <Analytics leads={leads} statuses={statuses} importHistory={importHistory} />
        )}

        {active === 'Settings' && (
          <SettingsPage settings={settings} onSettingsChange={setSettings} />
        )}

        {active !== 'Dashboard' && active !== 'Leads' && active !== 'Outreach' && active !== 'Analytics' && active !== 'Settings' && (
          <div className="rounded-3xl border border-line bg-blue-900/30 p-10 text-center text-paper/60">
            <p className="text-xl font-semibold text-paper">{active} is coming soon.</p>
            <p className="mt-3 text-sm">Use the Dashboard, Leads, or Analytics tabs while we build the rest of the workspace.</p>
          </div>
        )}
      </div>
    </div>
  )
}
