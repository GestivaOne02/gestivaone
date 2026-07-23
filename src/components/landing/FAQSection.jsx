import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'

const faqs = [
  {
    question: '¿Qué es GestivaOne y cómo ayuda a mi negocio?',
    answer: 'GestivaOne es una plataforma integral de gestión comercial en la nube diseñada para automatizar el control de inventarios, facturación, cuentas de cobro, impresión de recibos térmicos POS y reportes financieros en tiempo real para negocios en Colombia y Latinoamérica.'
  },
  {
    question: '¿Puedo conectar mi impresora térmica de recibos POS?',
    answer: 'Sí. GestivaOne es compatible con impresoras térmicas USB, Bluetooth y de red de 58mm y 80mm. Permite personalizar el diseño de tus recibos, agregar tu logo y emitir tickets de venta de forma automática.'
  },
  {
    question: '¿Cómo funciona el plan gratuito y qué incluye?',
    answer: 'El plan One Standard es totalmente gratuito para siempre. Incluye gestión de facturación básica, catálogo de productos e inventario, registro de ventas y módulo de clientes para un usuario administrador.'
  },
  {
    question: '¿Mis datos están respaldados de forma segura?',
    answer: 'Tus datos cuentan con un tiempo en línea garantizado del 99.9%, almacenamiento encriptado en la nube con cifrado SSL/TLS de nivel bancario y respaldos automáticos continuos.'
  },
  {
    question: '¿Puedo gestionar múltiples empleados y otorgar permisos?',
    answer: 'Sí. Los planes Pro y 360 permiten invitar a tu equipo de trabajo (despachadores, cajeros, contables) mediante invitaciones encriptadas y definir sus permisos específicos dentro del sistema.'
  },
  {
    question: '¿Cómo se envían los recibos y notificaciones a mis clientes?',
    answer: 'Puedes enviar facturas y comprobantes digitales directamente al correo electrónico de tu cliente vía SMTP o enviar notificaciones de cobro y recordatorios de pago instantáneos por WhatsApp Business.'
  }
]

export default function FAQSection() {
  const { t } = useLanguageStore()
  const [openIndex, setOpenIndex] = useState(0)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-10 bg-surface-800 border-t border-subtle">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold uppercase tracking-wider border border-brand-500/20">
            <HelpCircle size={14} />
            {t('faq.tag')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {t('faq.title')}
          </h2>
          <p className="text-sm text-muted-400">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="border border-subtle rounded-2xl bg-surface-900 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-surface-750 transition-colors"
                >
                  <span className="text-sm font-bold text-foreground">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-brand-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 pt-1 text-xs text-muted-400 leading-relaxed border-t border-subtle/40">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
