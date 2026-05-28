import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { useCurrencyStore } from './useCurrencyStore'

export const PLANS = {
  standard: {
    id: 'standard',
    name: 'One Standard (Gratis)',
    price: 0,
    priceDisplay: '$0',
    period: '/siempre',
    promoPrice: null,
    promoMonths: 0,
    color: 'brand',
    features: [
      '1 trabajador',
      'Facturación básica',
      'Gestión de clientes',
      'Inventario limitado',
      'Soporte comunitario',
    ],
    // Limits
    maxUsers: 1,
    hasReports: false,
    hasAdvancedDashboard: false,
    hasAPI: false,
  },
  pro: {
    id: 'pro',
    name: 'One Pro',
    price: 32000,
    priceDisplay: '$32.000',
    promoPrice: 7000,
    promoPriceDisplay: '$7.000',
    promoMonths: 1,
    promoLabel: '78% desc. primer mes',
    period: '/mes',
    color: 'brand',
    popular: true,
    features: [
      'Hasta 10 trabajadores',
      'Todo lo de Standard',
      'Dashboard avanzado',
      'Gestión de empleados',
      'Reportes PDF/Excel',
      'Soporte prioritario',
    ],
    // Limits
    maxUsers: 10,
    hasReports: true,
    hasAdvancedDashboard: true,
    hasAPI: false,
  },
  empresarial: {
    id: 'empresarial',
    name: 'One 360',
    price: 120000,
    priceDisplay: '$120.000',
    promoPrice: 80000,
    promoPriceDisplay: '$80.000',
    promoMonths: 3,
    promoLabel: '33% desc. primeros 3 meses',
    period: '/mes',
    color: 'brand',
    features: [
      'Hasta 30 trabajadores',
      'Todo lo de Pro',
      'Multi-sucursal',
      'API personalizada',
      'Gerente de cuenta dedicado',
      'SLA 99.9%',
    ],
    // Limits
    maxUsers: 30,
    hasReports: true,
    hasAdvancedDashboard: true,
    hasAPI: true,
  },
  master: {
    id: 'master',
    name: 'Master Admin',
    price: 0,
    priceDisplay: '$0',
    period: '/siempre',
    color: 'brand',
    features: ['Acceso total ilimitado'],
    maxUsers: 999999,
    hasReports: true,
    hasAdvancedDashboard: true,
    hasAPI: true,
  }
}

// Removed hardcoded SUPER_ADMINS for security. Use Supabase roles instead.
export const PREMIUM_EMAILS = [
  'randymendozasalas42@gmail.com',
  'dayanneguiselle@gmail.com'
]

export const ROLES = {
  administrador: {
    label: 'Administrador',
    color: 'brand',
    permissions: {
      dashboard: true,
      menu: true,
      products: true,
      settings: true,
      employees: true,
      account: true,
    },
  },
  despachador: {
    label: 'Despachador',
    color: 'warning',
    permissions: {
      dashboard: false,
      menu: true,
      products: true,
      settings: false,
      employees: false,
      account: true,
    },
  },
  contable: {
    label: 'Contable',
    color: 'success',
    permissions: {
      dashboard: true,
      menu: false,
      products: false,
      settings: false,
      employees: false,
      account: true,
    },
  },
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      initialized: false,

      // Initial session check and active listener
      init: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            await get().syncProfile(session.user.id)
          } else {
            set({ isAuthenticated: false, user: null })
          }
        } catch (e) {
          console.error('Session init error:', e)
          set({ isAuthenticated: false, user: null })
        } finally {
          set({ initialized: true })
        }

        // Keep session alive and synced across tabs
        supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (event === 'SIGNED_OUT' || !currentSession) {
            set({ isAuthenticated: false, user: null })
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Only sync if we don't already have the user to prevent infinite loops
            if (!get().user || get().user?.id !== currentSession.user.id) {
              await get().syncProfile(currentSession.user.id)
            }
          }
        })
      },

      register: async (data) => {
        set({ loading: true })
        
        // 1. Auth Signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        })

        if (authError) {
          set({ loading: false })
          return { success: false, error: authError.message }
        }

        const userId = authData.user.id

        // 2. Create Company
        const { data: company, error: compError } = await supabase
          .from('companies')
          .insert([{ 
            name: data.companyName, 
            logo_url: data.companyLogo
          }])
          .select()
          .single()

        if (compError) {
          set({ loading: false })
          return { success: false, error: 'Error al crear empresa: ' + compError.message }
        }

        // 3. Create Profile
        const isFreePremium = PREMIUM_EMAILS.includes(data.email?.toLowerCase())
        const { error: profError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            company_id: company.id,
            full_name: data.name || 'Usuario',
            email: data.email,
            phone: data.phone || '',
            plan: isFreePremium ? 'empresarial' : (data.plan || 'standard'),
            role: 'administrador'
          }])

        if (profError) {
          set({ loading: false })
          return { success: false, error: 'Error al crear perfil: ' + profError.message }
        }

        await get().syncProfile(userId)
        set({ loading: false })
        return { success: true }
      },

      linkWorkerAndRegister: async (data) => {
        set({ loading: true })
        const codeInput = data.linkCode?.trim().toUpperCase()

        if (!codeInput) {
          set({ loading: false })
          return { success: false, error: 'Por favor ingresa un código de vinculación' }
        }

        // --- STEP 1: Attempt to use the RPC function (Secure, atomic & bypasses RLS) ---
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('use_invitation_code', {
            inv_code: codeInput,
            worker_email: data.email
          })

          if (!rpcError && rpcData && rpcData.length > 0) {
            const { company_id, invite_role, company_plan } = rpcData[0]

            // 1. Auth Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email: data.email,
              password: data.password,
            })

            if (authError) {
              set({ loading: false })
              return { success: false, error: 'Error de autenticación: ' + authError.message }
            }

            const workerId = authData.user.id

            // 2. Insert Profile
            const { error: profError } = await supabase
              .from('profiles')
              .insert([{
                id: workerId,
                company_id: company_id,
                full_name: data.name,
                email: data.email,
                phone: data.phone || '',
                avatar_url: data.avatar || '',
                role: invite_role || 'despachador',
                plan: company_plan || 'standard'
              }])

            if (profError) {
              await supabase.auth.signOut()
              set({ loading: false })
              return { success: false, error: 'Error al vincular el perfil: ' + profError.message }
            }

            await get().syncProfile(workerId)
            set({ loading: false })
            return { success: true, role: invite_role }
          }
        } catch (rpcErr) {
          console.warn('RPC use_invitation_code failed, falling back to JS implementation...', rpcErr)
        }

        // --- STEP 2: Fallback JS implementation (Compatible, no SQL run needed) ---
        // 1. Perform auth sign up first to get authentication token (resolves select RLS issue)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        })

        if (authError) {
          set({ loading: false })
          return { success: false, error: 'Error de autenticación: ' + authError.message }
        }

        const workerId = authData.user.id

        // 2. Query company using containment filter (only fetches matching company settings, extremely secure)
        const { data: matchedCompanies, error: compFetchError } = await supabase
          .from('companies')
          .select('id, name, settings, plan')
          .contains('settings', { invitations: [{ code: codeInput }] })

        if (compFetchError || !matchedCompanies || matchedCompanies.length === 0) {
          await supabase.auth.signOut()
          set({ loading: false })
          return { success: false, error: 'Código de vinculación inválido o caducado.' }
        }

        const targetCompany = matchedCompanies[0]
        const invitations = targetCompany.settings?.invitations || []
        const activeInvite = invitations.find(
          (inv) => inv.code === codeInput && !inv.used && new Date(inv.expiresAt) > new Date()
        )

        if (!activeInvite) {
          await supabase.auth.signOut()
          set({ loading: false })
          return { success: false, error: 'El código de vinculación ya ha sido usado o está vencido.' }
        }

        // 3. Create the profile
        const { error: profError } = await supabase
          .from('profiles')
          .insert([{
            id: workerId,
            company_id: targetCompany.id,
            full_name: data.name,
            email: data.email,
            phone: data.phone || '',
            avatar_url: data.avatar || '',
            role: activeInvite.role || 'despachador',
            plan: targetCompany.plan || 'standard'
          }])

        if (profError) {
          await supabase.auth.signOut()
          set({ loading: false })
          return { success: false, error: 'Error al vincular el perfil: ' + profError.message }
        }

        // 4. Try updating the company settings (might fail under RLS, but we swallow warning so login succeeds)
        const updatedInvitations = invitations.map((inv) =>
          inv.code === codeInput ? { ...inv, used: true, usedBy: data.email, usedAt: new Date().toISOString() } : inv
        )
        const updatedSettings = {
          ...targetCompany.settings,
          invitations: updatedInvitations
        }

        const { error: updateCompError } = await supabase
          .from('companies')
          .update({ settings: updatedSettings })
          .eq('id', targetCompany.id)

        if (updateCompError) {
          console.warn('Could not consume invitation code in database settings:', updateCompError.message)
        }

        // 5. Sync profile & finalize
        await get().syncProfile(workerId)
        set({ loading: false })
        return { success: true, role: activeInvite.role }
      },

      login: async (email, password) => {
        set({ loading: true })
        
        // ── Normal Supabase Login ────────────────────────────────────
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        
        if (error) {
          set({ loading: false })
          return { success: false, error: 'Correo o contraseña incorrectos' }
        }

        await get().syncProfile(data.user.id)
        set({ loading: false })
        return { success: true, role: get().user?.role }
      },

      syncProfile: async (userId) => {
        try {
          // 1. Fetch Profile (using array instead of .single() to avoid 406 headers)
          const { data: profileList, error: profError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .limit(1)
          
          let profile = profileList?.[0]
          const { data: { user: authUser } } = await supabase.auth.getUser()

          // Auto-upgrade for premium administrators in database
          const isFreePremium = PREMIUM_EMAILS.includes(authUser?.email?.toLowerCase())
          if (isFreePremium && profile && profile.plan !== 'empresarial') {
            const { data: updatedList } = await supabase
              .from('profiles')
              .update({ plan: 'empresarial' })
              .eq('id', userId)
              .select()
            if (updatedList?.[0]) {
              profile = updatedList[0]
            }
          }

          if (profError || !profile) {
            console.warn('Profile not found, attempting to auto-recover...')
            
            // 1. Create a default company
            const { data: newComp } = await supabase
              .from('companies')
              .insert([{ name: 'Mi Empresa' }])
              .select()
              .single()

            if (newComp) {
              // 2. Insert the missing profile
              await supabase
                .from('profiles')
                .insert([{
                  id: userId,
                  company_id: newComp.id,
                  full_name: authUser?.email?.split('@')[0] || 'Usuario',
                  email: authUser?.email,
                  role: 'administrador',
                  plan: 'standard'
                }])
            }

            // Reload to fetch the freshly created profile properly
            window.location.reload()
            return
          }

          // 2. Fetch Company
          const { data: companyList } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profile.company_id)
            .limit(1)

          const company = companyList?.[0]
          
          // Auto-configure the app currency based on the company's registered currency
          if (company?.currency) {
            useCurrencyStore.getState().setSourceCurrency(company.currency)
          }


          const user = {
            id: profile.id,
            name: profile.full_name,
            email: authUser?.email,
            phone: profile.phone,
            role: profile.role,
            plan: isFreePremium ? 'empresarial' : profile.plan,
            companyId: profile.company_id,
            companyName: company?.name || 'Mi Empresa',
            companyLogo: company?.logo_url,
            country: company?.country || null,
            settings: company?.settings,
            branchId: profile.branch_id || null,
            permissions: profile.permissions || []
          }

          set({ isAuthenticated: true, user })

          // Dynamically import useSettingsStore and useNotificationStore to sync DB settings to frontend stores
          try {
            const { useSettingsStore } = await import('./useSettingsStore')
            const { useNotificationStore } = await import('./useNotificationStore')
            if (company?.settings) {
              useSettingsStore.getState().loadFromSettings(company.settings)
            }
            // Fetch and synchronize notifications from cloud database
            useNotificationStore.getState().fetchNotifications().then(() => {
              useNotificationStore.getState().syncNotifications()
            })
          } catch (e) {
            console.error('Error loading settings from DB to store:', e)
          }
        } catch (err) {
          console.error('Sync Profile Error:', err)
          // Last resort fallback to let user in
          set({ isAuthenticated: true, user: { id: userId, email: 'user@gestivaone.com', role: 'administrador' } })
        }
      },

      loginAsWorker: (workerData) => {
        set({ isAuthenticated: true, user: { ...workerData, isWorker: true } })
        return { success: true }
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ isAuthenticated: false, user: null })
      },

      updateProfile: async (data) => {
        const { user } = get()
        if (!user) return

        // Bypass for Master Admin (no DB profile)
        if (user.id.startsWith('master-')) {
          set({ user: { ...user, ...data } })
          return
        }

        // 1. Update Profile
        const profileUpdates = {}
        if (data.name !== undefined) profileUpdates.full_name = data.name
        if (data.phone !== undefined) profileUpdates.phone = data.phone
        if (data.company_id !== undefined) profileUpdates.company_id = data.company_id

        if (Object.keys(profileUpdates).length > 0) {
          await supabase.from('profiles').update(profileUpdates).eq('id', user.id)
        }

        // 2. Update Company
        const targetCompanyId = user.companyId || data.company_id
        if (targetCompanyId) {
          const companyUpdates = {}
          if (data.companyName !== undefined) companyUpdates.name = data.companyName
          if (data.companyLogo !== undefined) companyUpdates.logo_url = data.companyLogo
          if (data.country !== undefined) companyUpdates.country = data.country
          if (data.base_currency !== undefined) companyUpdates.currency = data.base_currency
          if (data.settings !== undefined) companyUpdates.settings = data.settings

          if (Object.keys(companyUpdates).length > 0) {
            await supabase.from('companies').update(companyUpdates).eq('id', targetCompanyId)
          }
        }

        await get().syncProfile(user.id)
      },
    }),
    {
      name: 'gestiva-auth-v2.2', // Bumped version to force a clean state
      onRehydrateStorage: () => (state) => {
        // Auto-refresh logic if needed or version check
        console.log('Auth storage rehydrated')
      }
    }
  )
)

