import { ShieldCheck, Lock, Server, MapPin, Award } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'

export default function TrustEEATSection() {
  const { t } = useLanguageStore()

  const trustItems = [
    {
      icon: Lock,
      title: t('trust.sslTitle'),
      desc: t('trust.sslDesc')
    },
    {
      icon: MapPin,
      title: t('trust.supportTitle'),
      desc: t('trust.supportDesc')
    },
    {
      icon: Server,
      title: t('trust.uptimeTitle'),
      desc: t('trust.uptimeDesc')
    },
    {
      icon: Award,
      title: t('trust.dianTitle'),
      desc: t('trust.dianDesc')
    }
  ]

  return (
    <section id="garantias" className="py-10 bg-surface-900 border-t border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20">
            <ShieldCheck size={14} />
            {t('trust.tag')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('trust.title')}
          </h2>
          <p className="text-sm text-muted-400">
            {t('trust.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="bg-surface-750 border border-subtle p-6 rounded-3xl space-y-3 hover:border-brand-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-400 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
