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

const users = []
let token
do {
  const page = await auth.listUsers(1000, token)
  users.push(...page.users)
  token = page.pageToken
} while (token)

const matches = users.filter((u) =>
  [u.uid, u.email, u.displayName].filter(Boolean).some((v) => v.toLowerCase().includes(keeper.toLowerCase()))
)
if (matches.length === 0) {
  console.log(`No account matches "${keeper}" among ${users.length} users. Nothing was deleted.`)
  await deleteApp(app)
  process.exit(2)
}
if (matches.length > 1) {
  console.log(`Ambiguous: ${matches.length} accounts match "${keeper}". Nothing was deleted.`)
  for (const m of matches) console.log(`  ${m.uid} ${m.email ?? ''} ${m.displayName ?? ''}`)
  await deleteApp(app)
  process.exit(2)
}

const keep = matches[0]
const others = users.filter((u) => u.uid !== keep.uid)
console.log(`keeper: ${keep.uid} ${keep.email ?? ''} ${keep.displayName ?? ''} (${users.length} users total)`)

let deletedUsers = 0
for (const u of others) {
  await auth.deleteUser(u.uid)
  deletedUsers++
}
console.log(`users deleted: ${deletedUsers}`)

for (const coll of ['projects', 'timeEntries']) {
  let deleted = 0
  let snaps = await db.collection(coll).where('userId', '==', keep.uid).select('userId').limit(1).get()
  let keeperDocs = !snaps.empty
  let page = await db.collection(coll).limit(500).get()
  while (!page.empty) {
    const batch = db.batch()
    for (const d of page.docs) {
      if (d.data().userId !== keep.uid) {
        batch.delete(d.ref)
        deleted++
      }
    }
    await batch.commit()
    page = await db.collection(coll).limit(500).get()
  }
  console.log(`${coll}: ${keeperDocs ? 'kept keeper docs | ' : ''}others deleted: ${deleted}`)
}

await deleteApp(app)
console.log('done')