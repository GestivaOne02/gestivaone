import React from 'react'
import Icon from '@/components/ui/Icon';


export default function EnvErrorScreen() {
  const [copiedKey, setCopiedKey] = React.useState(null)

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 text-foreground px-4 py-8 select-none">
      <div className="w-full max-w-2xl bg-surface-800/50 backdrop-blur-md border border-subtle rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-error-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center justify-center p-3.5 bg-error-500/10 text-error-400 rounded-2xl border border-error-500/20">
            <Icon name="AlertTriangle" className="w-8 h-8 animate-pulse"  />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Configuración Pendiente
          </h1>
          <p className="text-muted-400 text-sm md:text-base max-w-lg mx-auto">
            Las credenciales de conexión con tu base de datos de Supabase no están configuradas o contienen valores de ejemplo en tu archivo local.
          </p>
        </div>

        <div className="mt-8 space-y-6 relative z-10">
          
          {/* Step 1: Create File */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/30 text-sm font-bold">
              1
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-semibold text-sm md:text-base">Crear el archivo de configuración</h3>
              <p className="text-muted-400 text-xs md:text-sm">
                Crea un archivo de texto llamado <code className="bg-surface-700 text-brand-300 px-1.5 py-0.5 rounded text-xs">.env.local</code> en la carpeta raíz de tu proyecto.
              </p>
            </div>
          </div>

          {/* Step 2: Paste Credentials */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/30 text-sm font-bold">
              2
            </div>
            <div className="space-y-3 w-full">
              <div className="space-y-1">
                <h3 className="text-white font-semibold text-sm md:text-base">Copiar las siguientes variables</h3>
                <p className="text-muted-400 text-xs md:text-sm">
                  Pega las variables en tu archivo y reemplaza los valores de prueba con tus claves de Supabase:
                </p>
              </div>

              {/* Code Blocks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-surface-900 border border-subtle rounded-xl p-3 text-xs md:text-sm font-mono overflow-x-auto gap-3 text-left">
                  <div className="flex items-center gap-2 text-muted-300">
                    <Icon name="Server" className="w-4 h-4 text-brand-400"  />
                    <span>VITE_SUPABASE_URL=</span>
                    <span className="text-neutral-500">https://tu-proyecto.supabase.co</span>
                  </div>
                  <button 
                    onClick={() => handleCopy("VITE_SUPABASE_URL=https://tu-proyecto.supabase.co", 'url')}
                    className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-subtle text-muted-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'url' ? <Icon name="Check" className="w-3.5 h-3.5 text-success-400"  /> : <Icon name="Copy" className="w-3.5 h-3.5"  />}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-surface-900 border border-subtle rounded-xl p-3 text-xs md:text-sm font-mono overflow-x-auto gap-3 text-left">
                  <div className="flex items-center gap-2 text-muted-300">
                    <Icon name="Key" className="w-4 h-4 text-brand-400"  />
                    <span>VITE_SUPABASE_ANON_KEY=</span>
                    <span className="text-neutral-500">tu-anon-key-jwt-aqui</span>
                  </div>
                  <button 
                    onClick={() => handleCopy("VITE_SUPABASE_ANON_KEY=tu-anon-key-jwt-aqui", 'key')}
                    className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-subtle text-muted-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'key' ? <Icon name="Check" className="w-3.5 h-3.5 text-success-400"  /> : <Icon name="Copy" className="w-3.5 h-3.5"  />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Run project */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/30 text-sm font-bold">
              3
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-semibold text-sm md:text-base">Reiniciar servidor de desarrollo</h3>
              <p className="text-muted-400 text-xs md:text-sm">
                Guarda el archivo y ejecuta <code className="bg-surface-700 text-neutral-300 px-1.5 py-0.5 rounded text-xs">npm run dev</code> en tu terminal. La página se actualizará automáticamente una vez conectada.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-subtle flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 text-xs text-muted-400">
          <span>¿Necesitas ayuda? Revisa tu panel en supabase.com → Settings → API</span>
          <a 
            href="https://supabase.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-surface-700 hover:bg-surface-600 text-white rounded-xl border border-subtle transition-colors text-center w-full md:w-auto"
          >
            Ir a Supabase
          </a>
        </div>

      </div>
    </div>
  )
}
