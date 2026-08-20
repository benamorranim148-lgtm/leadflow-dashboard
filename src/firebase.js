// Firebase scaffold for LeadFlow
// 1) Install the SDK: `npm install firebase`
// 2) Replace the `firebaseConfig` placeholder with your project's web config
// 3) Import helpers from this file in `App.jsx` and wire listeners

import firebaseConfig from './firebaseConfig'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  where,
  addDoc,
  orderBy,
} from 'firebase/firestore'

let app = null
let db = null
let auth = null

export function initFirebase(config = null) {
  const cfg = config || firebaseConfig
  if (!app) {
    app = initializeApp(cfg)
    db = getFirestore(app)
    auth = getAuth(app)
  }
  return { app, db, auth }
}

export function getDB() {
  if (!db) initFirebase()
  return db
}

export function getAuthInstance() {
  if (!auth) initFirebase()
  return auth
}

export async function signIn(email, password) {
  const a = getAuthInstance()
  return signInWithEmailAndPassword(a, email, password)
}

export async function signOutUser() {
  const a = getAuthInstance()
  return signOut(a)
}

export function onAuthChange(cb) {
  const a = getAuthInstance()
  return onAuthStateChanged(a, cb)
}

// Subscribe to leads. If `clientId` is provided, only subscribe to leads for that client.
export function subscribeLeads(cb, clientId = null) {
  const database = getDB()
  try {
    if (clientId) {
      const q = query(collection(database, 'leads'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'))
      return onSnapshot(q, (snap) => {
        const items = []
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }))
        cb(items)
      })
    }
    // admin: subscribe to all leads
    const q = query(collection(database, 'leads'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      const items = []
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }))
      cb(items)
    })
  } catch (e) {
    // fallback: call cb with empty
    cb([])
    return () => {}
  }
}

// Create a lead document for the given clientId
export async function createLeadsForClient(clientId, leadRows = []) {
  const database = getDB()
  const created = []
  for (const row of leadRows) {
    const docRef = await addDoc(collection(database, 'leads'), {
      name: row.name || 'Unnamed',
      address: row.address || '',
      website: row.website || '',
      phone: row.phone || '',
      score: parseInt(row.score, 10) || 0,
      reason: row.reason || '',
      status: row.status || 'New',
      clientId: clientId,
      createdAt: serverTimestamp(),
    })
    created.push({ id: docRef.id })
  }
  return created
}

// Update only the status field for a lead
export async function updateLeadStatus(leadId, status) {
  const database = getDB()
  const ref = doc(database, 'leads', leadId)
  await setDoc(ref, { status, updatedAt: serverTimestamp() }, { merge: true })
}

// Subscribe to the users collection (admin use)
export function subscribeUsers(cb) {
  const database = getDB()
  try {
    const q = query(collection(database, 'users'))
    return onSnapshot(q, (snap) => {
      const items = []
      snap.forEach((d) => items.push({ id: d.id, ...d.data() }))
      cb(items)
    })
  } catch (e) {
    cb([])
    return () => {}
  }
}

// Helper to fetch a user's profile doc
export async function getUserDoc(uid) {
  const database = getDB()
  const ref = doc(database, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data()
}

// Programmatic Auth user creation via Cloud Functions is intentionally omitted.
// Admins should create Auth users in the Firebase Console and then create
// a corresponding `users/{uid}` Firestore document (see `createUserDoc`).
// Create a Firestore `users/{uid}` document. Admins can use this after
// creating an Auth user via the Firebase Console and copying the UID.
export async function createUserDoc(uid, email, businessName, role = 'client') {
  const database = getDB()
  const ref = doc(database, 'users', uid)
  await setDoc(ref, { email, businessName: businessName || '', role, createdAt: serverTimestamp() }, { merge: true })
  return { id: uid }
}

// (Deprecated) programmatic account creation via Cloud Function removed.
export default {
  initFirebase,
  getDB,
  getAuthInstance,
  signIn,
  signOutUser,
  onAuthChange,
  subscribeLeads,
  createLeadsForClient,
  subscribeUsers,
  getUserDoc,
  createUserDoc,
  updateLeadStatus,
}
