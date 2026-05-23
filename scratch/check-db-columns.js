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
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'clients' })
  if (error) {
    // If RPC doesn't exist, try querying a row and checking keys
    console.warn('RPC not found, attempting direct select check...')
    const { data: rows, error: sErr } = await supabase.from('clients').select('*').limit(1)
    if (sErr) console.error(sErr)
    else console.log('Clients columns:', rows)
  } else {
    console.log('Clients columns via RPC:', data)
  }
}

run()
