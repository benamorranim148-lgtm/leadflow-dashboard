
import { useState, useEffect } from 'react'
import { createUserDoc, subscribeUsers } from './firebase.js'

export default function AdminClientsPage() {
  const [clients, setClients] = useState([])
  const [uid, setUid] = useState('')
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const unsub = subscribeUsers((items) => setClients(items))
    return () => unsub && unsub()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await createUserDoc(uid, email, businessName, 'client')
      setUid('')
      setEmail('')
      setBusinessName('')
    } catch (err) {
      console.error(err)
      alert('Failed to link client: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Clients</h2>
      <p className="text-xs text-paper/50 mb-4">
        First create the login in Firebase Console → Authentication → Add user.
        Then paste their UID + email here to link their account.
      </p>
      <div className="mb-6">
        <form onSubmit={handleCreate} className="flex gap-2 items-end flex-wrap">
          <input required value={uid} onChange={(e) => setUid(e.target.value)} placeholder="Firebase UID" className="rounded-md p-2 bg-blue-950 border border-line" />
          <input required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="rounded-md p-2 bg-blue-950 border border-line" />
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business name" className="rounded-md p-2 bg-blue-950 border border-line" />
          <button disabled={busy} className="bg-signal text-blue-950 rounded-md px-3 py-2">Link client</button>
        </form>
      </div>

      <div className="rounded-xl border border-line p-4 bg-blue-900/30">
        {clients.length === 0 ? (
          <p className="text-paper/40">No clients yet.</p>
        ) : (
          <ul className="space-y-2">
            {clients.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.businessName || c.email}</p>
                  <p className="text-xs text-paper/50">{c.email}</p>
                </div>
                <div className="text-sm text-paper/50">{c.role}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}