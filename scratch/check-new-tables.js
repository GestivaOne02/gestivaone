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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function run() {
  console.log('--- Testing New Schema ---')
  
  const { data: expenses, error: exErr } = await supabase.from('expenses').select('*').limit(1)
  if (exErr) console.error('❌ Error fetching expenses:', exErr)
  else console.log('✅ Expenses table exists! Columns:', expenses.length > 0 ? Object.keys(expenses[0]) : 'Empty, but schema is active')

  const { data: payments, error: payErr } = await supabase.from('invoice_payments').select('*').limit(1)
  if (payErr) console.error('❌ Error fetching invoice_payments:', payErr)
  else console.log('✅ Invoice_payments table exists! Columns:', payments.length > 0 ? Object.keys(payments[0]) : 'Empty, but schema is active')

  const { data: notifs, error: notifErr } = await supabase.from('notifications').select('*').limit(1)
  if (notifErr) console.error('❌ Error fetching notifications:', notifErr)
  else console.log('✅ Notifications table exists! Columns:', notifs.length > 0 ? Object.keys(notifs[0]) : 'Empty, but schema is active')

  // Let's check new columns in products, clients, invoices
  const { data: products, error: prErr } = await supabase.from('products').select('*').limit(1)
  if (prErr) console.error('❌ Error fetching products:', prErr)
  else {
    const hasCost = products.length > 0 ? 'cost' in products[0] : 'Check via empty'
    console.log('✅ Products table verified. Has cost column:', hasCost)
  }

  const { data: clients, error: clErr } = await supabase.from('clients').select('*').limit(1)
  if (clErr) console.error('❌ Error fetching clients:', clErr)
  else {
    const hasDocType = clients.length > 0 ? 'document_type' in clients[0] : 'Check via empty'
    console.log('✅ Clients table verified. Has document_type column:', hasDocType)
  }

  const { data: invoices, error: invErr } = await supabase.from('invoices').select('*').limit(1)
  if (invErr) console.error('❌ Error fetching invoices:', invErr)
  else {
    const hasTax = invoices.length > 0 ? 'tax' in invoices[0] : 'Check via empty'
    console.log('✅ Invoices table verified. Has tax column:', hasTax)
  }
}

run()
