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
  // Query pg_policies via RPC or raw query if possible, or try updating companies to see the exact error
  // Let's try to update companies with a dummy update to see the RLS error or success response!
  const { data, error } = await supabase
    .from('companies')
    .update({ name: 'Mi Empresa Test' })
    .eq('id', '00000000-0000-0000-0000-000000000000') // Non-existent ID, but let's see if it errors
    .select()
  
  console.log('Update result:', { data, error })
}

run()
