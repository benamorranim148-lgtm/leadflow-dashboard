import { useState } from 'react'
import { signIn } from './firebase.js'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await signIn(email, password)
      onLogin && onLogin()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-blue-950 p-8 rounded-2xl border border-line">
      <h2 className="text-lg font-semibold mb-4">Sign in</h2>
      {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full rounded-lg p-3 bg-blue-900 border border-line" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full rounded-lg p-3 bg-blue-900 border border-line" />
        <button className="w-full bg-signal text-blue-950 rounded-lg py-2">Sign in</button>
      </form>
    </div>
  )
}
