import { motion } from 'framer-motion'
import Icon from '@/components/ui/Icon';

export default function FloatingWhatsApp() {
  const whatsappUrl = 'https://wa.me/573044059862?text=Hola%20equipo%20GestivaOne,%20quisiera%20más%20información%20sobre%20la%20plataforma.'

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3 rounded-full shadow-2xl transition-colors font-bold text-xs group"
      aria-label="Hablar por WhatsApp"
      title="Atención Comercial WhatsApp"
    >
      <Icon name="MessageCircle" size={20} className="fill-white/20"  />
      <span className="hidden sm:inline">¿Dudas? Habla con un Asesor</span>
    </motion.a>
  )
}
