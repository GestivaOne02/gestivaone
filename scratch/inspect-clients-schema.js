import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env', 'utf8')
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/)
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)

const supabaseUrl = urlMatch ? urlMatch[1].trim() : ''
const supabaseKey = keyMatch ? keyMatch[1].trim() : ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.rpc('get_table_columns', { t_name: 'clients' })
  console.log('Columns via RPC:', data)
  console.log('Error via RPC:', error)

  // Fallback: try inserting with invalid fields to see what columns fail or check what fields are there
  const testClient = {
    company_id: '861a293a-86c3-4d40-bf5d-16a782b13c72', // mock uuid
    name: 'Test Client schema',
    type: 'express',
    email: 'test@schema.com',
    phone: '12345678',
    address: 'Calle Test',
    document_id: '123456',
    document_type: '13'
  }
  const { data: insData, error: insError } = await supabase.from('clients').insert([testClient]).select()
  console.log('Insert result:', insData)
  console.log('Insert error:', insError)
}
test()
