import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import type { NewTimeEntry, TimeEntry } from '../lib/types'

export function useTimeEntries() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'timeEntries'),
      where('userId', '==', user.uid),
      orderBy('start', 'desc'),
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as TimeEntry),
      )
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  const runningEntries = useMemo(
    () => entries.filter((e) => e.end === null),
    [entries],
  )

  async function addEntry(data: NewTimeEntry): Promise<string> {
    if (!user) throw new Error('Not signed in')
    const ref = doc(collection(db, 'timeEntries'))
    await setDoc(ref, {
      ...data,
      userId: user.uid,
      createdAt: Date.now(),
    })
    return ref.id
  }

  async function updateEntry(id: string, data: Partial<TimeEntry>) {
    await updateDoc(doc(db, 'timeEntries', id), data)
  }

  async function deleteEntry(id: string) {
    await deleteDoc(doc(db, 'timeEntries', id))
  }

  return {
    entries,
    loading,
    runningEntries,
    addEntry,
    updateEntry,
    deleteEntry,
  }
}
