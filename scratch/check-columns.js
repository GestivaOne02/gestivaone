import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually parse .env
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

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  const { data: clients, error: clErr } = await supabase.from('clients').select('*').limit(1)
  if (clErr) console.error('Error fetching clients:', clErr)
  else console.log('Clients sample keys:', clients.length > 0 ? Object.keys(clients[0]) : 'No records')

  const { data: products, error: prErr } = await supabase.from('products').select('*').limit(1)
  if (prErr) console.error('Error fetching products:', prErr)
  else console.log('Products sample keys:', products.length > 0 ? Object.keys(products[0]) : 'No records')

  const { data: invoices, error: invErr } = await supabase.from('invoices').select('*').limit(1)
  if (invErr) console.error('Error fetching invoices:', invErr)
  else console.log('Invoices sample keys:', invoices.length > 0 ? Object.keys(invoices[0]) : 'No records')
}

run()
