import { useEffect, useState } from 'react'
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
import type { NewProject, Project } from '../lib/types'

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProjects([])
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Project),
      )
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  async function createProject(data: NewProject): Promise<string> {
    if (!user) throw new Error('Not signed in')
    const ref = doc(collection(db, 'projects'))
    await setDoc(ref, {
      ...data,
      userId: user.uid,
      archived: false,
      createdAt: Date.now(),
    })
    return ref.id
  }

  async function updateProject(id: string, data: Partial<Project>) {
    await updateDoc(doc(db, 'projects', id), data)
  }

  async function deleteProject(id: string) {
    await deleteDoc(doc(db, 'projects', id))
  }

  return { projects, loading, createProject, updateProject, deleteProject }
}
