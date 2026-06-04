import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    const key = parts[0].trim()
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '')
    env[key] = val
  }
})

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function run() {
  const { data: rows, error: sErr } = await supabase.from('companies').select('*').limit(1)
  if (sErr) {
    console.error('Error fetching companies:', sErr)
  } else {
    console.log('Companies columns:', rows[0] ? Object.keys(rows[0]) : 'No companies found')
    console.log('Sample row:', rows[0])
  }
}

run()
