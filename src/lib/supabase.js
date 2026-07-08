import { createClient } from '@supabase/supabase-js'
 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
 
// Validate that we have real credentials and not the example placeholder values
export const hasValidSupabaseCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-name.supabase.co' &&
  !supabaseAnonKey.includes('your-supabase-anon-key')
 
export const supabase = hasValidSupabaseCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({}, {
      get: (target, prop) => {
        // Return dummy mock function chains to prevent runtime crashes during initial store evaluations
        return () => ({
          select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
          insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
          update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
          delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
          channel: () => ({ on: () => ({ subscribe: () => {} }) }),
          auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
          }
        })[prop] || (() => Promise.resolve({ data: null, error: null }))
      }
    })
