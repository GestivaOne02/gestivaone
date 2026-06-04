import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load .env
const env = fs.readFileSync('.env', 'utf8')
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/)
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)

const supabaseUrl = urlMatch ? urlMatch[1].trim() : ''
const supabaseKey = keyMatch ? keyMatch[1].trim() : ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('clients').select('*').limit(1)
  console.log('Sample client data:', data)
  console.log('Error:', error)
}
test()
