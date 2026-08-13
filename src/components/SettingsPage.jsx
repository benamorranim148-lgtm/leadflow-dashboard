import { useMemo } from 'react'
import { Bell, Briefcase, CreditCard, Globe, Mail, ImageIcon, Settings2 } from 'lucide-react'

const OFFER_PLANS = [
  {
    key: 'Free Sample',
    price: 'Gratuit',
    description: '3-5 leads (name + contact + location), so the client can see quality before committing',
  },
  {
    key: 'Tier 1 — Starter',
    price: '200 DT',
    description: '15 leads + contact + location (one-time)',
  },
  {
    key: 'Tier 2 — Monthly',
    price: '400 DT/mois',
    description: 'Leads generated weekly + tracking',
  },
  {
    key: 'Tier 3 — Starter + Outreach',
    price: '300 DT',
    description: '15 leads + contact + location + cold messages (one-time)',
  },
  {
    key: 'Tier 4 — Monthly + Outreach',
    price: '500 DT/mois',
    description: 'Weekly leads + tracking + outreach messages',
  },
]

const DEFAULT_SETTINGS = {
  businessName: '',
  contactEmail: '',
  businessLocation: '',
  businessContact: '',
  logoUrl: '',
  notifications: {
    productUpdates: true,
    leadAlerts: true,
    weeklySummary: false,
  },
  plan: 'Free Sample',
  billingCycle: 'Monthly',
  billingMethod: 'Post',
  dashboardAccess: false,
  supportQuestion: '',
}

export default function SettingsPage({ settings, onSettingsChange }) {
  const current = useMemo(() => ({ ...DEFAULT_SETTINGS, ...settings }), [settings])

  const updateField = (field, value) => {
    onSettingsChange?.({
      ...current,
      [field]: value,
    })
  }

  const updateNotification = (key, value) => {
    onSettingsChange?.({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: value,
      },
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="font-sans font-bold text-3xl">Settings</h1>
          <p className="text-paper/60 mt-2">Manage your account, notifications, and plan details from one place.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] mb-6">
        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-blue-900/30 p-6">
            <div className="flex items-center gap-3 mb-5">
              <Settings2 size={20} className="text-signal" />
              <div>
                <p className="font-semibold text-lg">Business profile</p>
                <p className="text-paper/60 text-sm">Client account details and contact information.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-paper/70">Business name</span>
                <input
                  type="text"
                  value={current.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-blue-950 px-4 py-3 text-sm text-paper placeholder:text-paper/40"
                  placeholder="Example Co."
                />
              </label>

              <label className="block">
                <span className="text-sm text-paper/70">Contact email</span>
                <input
                  type="email"
                  value={current.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-blue-950 px-4 py-3 text-sm text-paper placeholder:text-paper/40"
                  placeholder="hello@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm text-paper/70">Business location</span>
                <input
                  type="text"
                  value={current.businessLocation}
                  onChange={(e) => updateField('businessLocation', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-blue-950 px-4 py-3 text-sm text-paper placeholder:text-paper/40"
                  placeholder="City, State or Address"
                />
              </label>

              <label className="block">
                <span className="text-sm text-paper/70">Business contact</span>
                <input
                  type="text"
                  value={current.businessContact}
                  onChange={(e) => updateField('businessContact', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-blue-950 px-4 py-3 text-sm text-paper placeholder:text-paper/40"
                  placeholder="Phone or alternate email"
                />
              </label>
            </div>

            <label className="block mt-4">
              <span className="text-sm text-paper/70">Logo URL</span>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="url"
                  value={current.logoUrl}
                  onChange={(e) => updateField('logoUrl', e.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-line bg-blue-950 px-4 py-3 text-sm text-paper placeholder:text-paper/40"
                  placeholder="https://...png"
                />
                <div className="h-12 w-12 rounded-2xl bg-blue-950 border border-line flex items-center justify-center text-paper/40">
                  {current.logoUrl ? (
                    <img src={current.logoUrl} alt="Logo preview" className="max-h-10 max-w-10 object-contain" />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                </div>
              </div>
            </label>
          </section>

          <section className="rounded-3xl border border-line bg-blue-900/30 p-6">
            <div className="flex items-center gap-3 mb-5">
              <Bell size={20} className="text-signal" />
              <div>
                <p className="font-semibold text-lg">Notification preferences</p>
                <p className="text-paper/60 text-sm">Choose which updates and alerts you want to receive.</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'productUpdates', label: 'Product updates & features' },
                { key: 'leadAlerts', label: 'New lead alerts' },
                { key: 'weeklySummary', label: 'Weekly performance summary' },
              ].map((item) => (
                <label key={item.key} className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-blue-950 px-4 py-4 text-sm transition hover:border-signal">
                  <input
                    type="checkbox"
                    checked={current.notifications[item.key]}
                    onChange={(e) => updateNotification(item.key, e.target.checked)}
                    className="h-4 w-4 rounded border border-paper/20 bg-blue-900 text-signal"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-blue-900/30 p-6">
            <div className="flex items-center gap-3 mb-5">
              <Briefcase size={20} className="text-signal" />
              <div>
                <p className="font-semibold text-lg">Paid dashboard access</p>
                <p className="text-paper/60 text-sm">Allow this client to use the Dashboard page.</p>
              </div>
            </div>

            <label className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-blue-950 px-4 py-4 text-sm transition hover:border-signal">
              <input
                type="checkbox"
                checked={current.dashboardAccess}
                onChange={(e) => updateField('dashboardAccess', e.target.checked)}
                className="h-4 w-4 rounded border border-paper/20 bg-blue-900 text-signal"
              />
              <span>Enable Dashboard access</span>
            </label>
          </section>

          <section className="rounded-3xl border border-line bg-blue-900/30 p-6">
            <div className="flex items-center gap-3 mb-5">
              <Mail size={20} className="text-signal" />
              <div>
                <p className="font-semibold text-lg">Question for us</p>
                <p className="text-paper/60 text-sm">Leave a short note and we’ll use it to tailor your account setup.</p>
              </div>
            </div>

            <label className="block">
              <span className="text-sm text-paper/70">Your question or note</span>
              <textarea
                value={current.supportQuestion}
                onChange={(e) => updateField('supportQuestion', e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-line bg-blue-950 px-4 py-3 text-sm text-paper placeholder:text-paper/40"
                placeholder="What can we do to improve your lead flow?"
              />
            </label>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-line bg-blue-900/30 p-6">
            <div className="flex items-center gap-3 mb-5">
              <CreditCard size={20} className="text-signal" />
              <div>
                <p className="font-semibold text-lg">Your Plan</p>
                <p className="text-paper/60 text-sm">Pick a plan and save it with the client’s profile.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {OFFER_PLANS.map((plan) => {
                const isSelected = current.plan === plan.key
                return (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => updateField('plan', plan.key)}
                    className={`group w-full rounded-3xl border px-5 py-4 text-left transition ${
                      isSelected ? 'border-signal bg-signal/10 shadow-[0_0_0_1px_rgb(52,211,153)]' : 'border-line bg-blue-950 hover:border-signal'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-paper">{plan.key}</p>
                        <p className="mt-1 text-sm text-paper/60">{plan.description}</p>
                      </div>
                      <span className="rounded-2xl bg-blue-950 px-3 py-1 text-xs uppercase tracking-[0.16em] text-paper/70">{plan.price}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-blue-950 p-4 border border-line text-sm text-paper/80">
              <p className="font-semibold text-paper">Billing method</p>
              <p className="mt-2">Billing will be handled via post only.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-blue-900/30 p-6">
            <div className="flex items-center gap-3 mb-5">
              <Globe size={20} className="text-signal" />
              <div>
                <p className="font-semibold text-lg">Support</p>
                <p className="text-paper/60 text-sm">Need help with your account?</p>
              </div>
            </div>

            <p className="text-sm text-paper/70">Reach out to support anytime at <span className="text-paper">support@leadflow.tn</span>.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
