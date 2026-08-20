import { createContext, useContext, useEffect, useState } from 'react'
import firebase, { initFirebase, onAuthChange, getUserDoc } from './firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initFirebase()
    const unsub = onAuthChange(async (u) => {
      setUser(u)
      if (!u) {
        setProfile(null)
        setLoading(false)
        return
      }
     try {
  const doc = await getUserDoc(u.uid)
  console.log('DEBUG uid:', u.uid)
  console.log('DEBUG firestore doc:', doc)
  setProfile({ uid: u.uid, email: u.email, ...(doc || {}) })
} catch (e) {
  console.log('DEBUG error fetching user doc:', e)
  setProfile({ uid: u.uid, email: u.email })
}
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
