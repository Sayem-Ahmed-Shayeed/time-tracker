import { readFileSync, existsSync } from 'node:fs'
import { initializeApp, cert, deleteApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const SA_FILE = 'serviceAccountKey.json'
if (!existsSync(SA_FILE)) {
  console.log('Missing service account key.')
  console.log('Firebase console > Project settings > Service accounts > Generate new private key,')
  console.log(`save it as ${SA_FILE} next to this script, then rerun.`)
  process.exit(1)
}

const keeper = process.argv[2] ?? 'shaayeedaahmed2'

const app = initializeApp({ credential: cert(JSON.parse(readFileSync(SA_FILE, 'utf8'))) })
const auth = getAuth(app)
const db = getFirestore(app)

let keeperUid = null
let totalUsers = 0
let deletedUsers = 0
const listAll = async (next) => {
  const page = await auth.listUsers(1000, next)
  totalUsers += page.users.length
  for (const u of page.users) {
    const hay = [u.uid, u.email, u.displayName].filter(Boolean).map((v) => v.toLowerCase())
    if (hay.some((v) => v.includes(keeper.toLowerCase()))) {
      keeperUid = u.uid
      console.log(`keeper: ${u.uid} ${u.email ?? ''} ${u.displayName ?? ''}`)
    } else {
      await auth.deleteUser(u.uid)
      deletedUsers++
    }
  }
  return page.pageToken
}
let token
do {
  token = await listAll(token)
} while (token)

if (!keeperUid) {
  console.log(`No account matching "${keeper}" among ${totalUsers} users. Nothing deleted.`)
  await deleteApp(app)
  process.exit(2)
}

let deletedEntries = 0
const snaps = await db.collection('timeEntries').where('userId', '!=', keeperUid).select('userId').limit(500).get()
while (!snaps.empty) {
  const batch = db.batch()
  for (const s of snaps.docs) {
    batch.delete(s.ref)
    deletedEntries++
  }
  await batch.commit()
  const next = await db.collection('timeEntries').where('userId', '!=', keeperUid).select('userId').limit(500).get()
  snaps.docs.length = 0
  snaps.docs.push(...next.docs)
  if (snaps.empty) break
}

let deletedProjects = 0
const snaps2 = await db.collection('projects').where('userId', '!=', keeperUid).select('userId').limit(500).get()
while (!snaps2.empty) {
  const batch = db.batch()
  for (const s of snaps2.docs) {
    batch.delete(s.ref)
    deletedProjects++
  }
  await batch.commit()
  const next = await db.collection('projects').where('userId', '!=', keeperUid).select('userId').limit(500).get()
  snaps2.docs.length = 0
  snaps2.docs.push(...next.docs)
  if (snaps2.empty) break
}

console.log(`users found: ${totalUsers} | deleted: ${deletedUsers}`)
console.log(`time entries deleted (others): ${deletedEntries}`)
console.log(`projects deleted (others): ${deletedProjects}`)
console.log(`kept: ${keeperUid} + their projects/time entries`)
await deleteApp(app)
