import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
]

export const TRANSLATIONS = {
  es: {
    nav: {
      features: 'Características',
      about: 'Nosotros',
      pricing: 'Precios',
      contact: 'Contacto',
      marketplace: 'Marketplace',
      start: 'Empieza Tu Gestión',
      login: 'Ingresar',
      menu: 'Menú',
      ecosystem: 'Ecosistema',
      moreProducts: 'Más productos de Gestiva',
    },
    hero: {
      badge: 'Plataforma Integral de Gestión Comercial',
      title1: 'Control Total de tu',
      title2: 'Negocio en un Solo Lugar',
      desc: 'La plataforma moderna que necesitas para automatizar inventarios, facturación, cuentas de cobro, reportes financieros y más, diseñada para optimizar cada proceso en tu empresa.',
      ctaPrimary: 'Empieza Tu Gestión Gratis',
      ctaSecondary: 'Ver Características',
      trustMicro: 'Sin tarjeta de crédito • Configuración en 1 min • Plan gratuito',
    },
    family: {
      title: 'Familia GestivaOne',
      subtitle: '¿Quieres ser parte de nuestra comunidad de empresarios?',
      cta: 'Únete a la familia',
    },
    features: {
      tag: 'Módulos y Soluciones',
      title: 'Todo lo que tu Empresa Necesita para Crecer',
      subtitle: 'Herramientas diseñadas para agilizar la operación diaria de tu negocio.',
      posTitle: 'Punto de Venta (POS)',
      posDesc: 'Facturación rápida e intuitiva para ventas de mostrador y código de barras.',
      invTitle: 'Inventario Inteligente',
      invDesc: 'Control de existencias en tiempo real, alertas de stock mínimo y trazabilidad.',
      dianTitle: 'Facturación Electrónica DIAN',
      dianDesc: 'Emisión directa de facturas y notas crédito validadas ante la DIAN.',
      analyticsTitle: 'Reportes y Analítica',
      analyticsDesc: 'Estadísticas financieras, flujo de caja y rentabilidad de productos al instante.',
      crmTitle: 'CRM y Clientes',
      crmDesc: 'Gestión de cartera, historial de compras e integración con WhatsApp.',
      restaurantTitle: 'Módulo Restaurantes',
      restaurantDesc: 'Comandas digitales, control de mesas y recetas para gastronomía.',
    },
    usecases: {
      tag: 'Casos de Uso',
      title: 'Adaptado a la Industria de tu Negocio',
      subtitle: 'Descubre cómo GestivaOne transforma la gestión de cada sector.',
    },
    geo: {
      tag: 'Infraestructura & Tecnología',
      title: 'Tecnología Robusta Diseñada para tu Empresa',
      subtitle: 'Infraestructura Cloud, hardware POS e integraciones financieras listas para operar desde el primer día.',
    },
    faq: {
      tag: 'Preguntas Frecuentes',
      title: 'Resolvemos tus Dudas sobre GestivaOne',
      subtitle: 'Todo lo que necesitas saber antes de empezar.',
    },
    trust: {
      tag: 'Compromiso de Seguridad y Confianza',
      title: 'Transparencia y Seguridad Garantizada para tu Negocio',
      desc: 'Protegemos la información de tu empresa con los más altos estándares tecnológicos del mercado.',
      sslTitle: 'Cifrado SSL/TLS de Nivel Bancario',
      sslDesc: 'Toda la información comercial y financiera transita bajo protocolos de cifrado punto a punto en la nube.',
      supportTitle: 'Soporte e Infraestructura Local',
      supportDesc: 'Atención técnica personalizada desde Barranquilla, Colombia para pymes y comerciantes de la región.',
      uptimeTitle: '99.9% Uptime & Respaldos Continuos',
      uptimeDesc: 'Servidores de alta disponibilidad con copias de seguridad automatizadas para garantizar cero pérdida de datos.',
      dianTitle: 'Cumplimiento Normativo Contable',
      dianDesc: 'Plataforma adaptada a las exigencias tributarias, formatos PDF estándar y soporte de facturación electrónica DIAN.',
    },
    prefooter: {
      title: 'Sé GestivaOne',
      desc: 'Únete a miles de comerciantes y empresas que ya automatizaron sus ventas, inventarios y facturación electrónica.',
      btn: 'Empieza a gestionar',
    },
    footer: {
      colombia: 'Nacimos en Colombia',
      colProducts: 'Productos',
      colResources: 'Recursos',
      colLegal: 'Legal',
      colSocial: 'Redes Sociales',
      rights: 'Todos los derechos reservados.',
    },
  },
  en: {
    nav: {
      features: 'Features',
      about: 'About Us',
      pricing: 'Pricing',
      contact: 'Contact',
      marketplace: 'Marketplace',
      start: 'Start Management',
      login: 'Log In',
      menu: 'Menu',
      ecosystem: 'Ecosystem',
      moreProducts: 'More Gestiva products',
    },
    hero: {
      badge: 'All-In-One Business Management Platform',
      title1: 'Full Control of your',
      title2: 'Business in One Place',
      desc: 'The modern platform you need to automate inventory, invoicing, receivables, financial reporting, and more, designed to optimize every process in your company.',
      ctaPrimary: 'Start Your Free Management',
      ctaSecondary: 'View Features',
      trustMicro: 'No credit card required • 1 min setup • Free plan available',
    },
    family: {
      title: 'GestivaOne Family',
      subtitle: 'Want to join our business community?',
      cta: 'Join the family',
    },
    features: {
      tag: 'Modules & Solutions',
      title: 'Everything your Business Needs to Grow',
      subtitle: 'Tools designed to streamline your daily company operations.',
      posTitle: 'Point of Sale (POS)',
      posDesc: 'Fast and intuitive invoicing for counter sales and barcode scanning.',
      invTitle: 'Smart Inventory',
      invDesc: 'Real-time stock control, minimum inventory alerts, and product traceability.',
      dianTitle: 'DIAN Electronic Invoicing',
      dianDesc: 'Direct issuance of invoices and credit notes validated with tax authorities.',
      analyticsTitle: 'Reports & Analytics',
      analyticsDesc: 'Instant financial statistics, cash flow statements, and product profitability.',
      crmTitle: 'CRM & Customers',
      crmDesc: 'Receivables management, purchase history, and WhatsApp integration.',
      restaurantTitle: 'Restaurant Module',
      restaurantDesc: 'Digital kitchen tickets, table management, and recipe control for gastronomy.',
    },
    usecases: {
      tag: 'Use Cases',
      title: 'Tailored to your Industry',
      subtitle: 'Discover how GestivaOne transforms management in every sector.',
    },
    geo: {
      tag: 'Infrastructure & Tech',
      title: 'Robust & High-Performance Platform',
      subtitle: 'Cloud infrastructure, POS hardware & financial integrations ready for non-stop operations.',
    },
    faq: {
      tag: 'Frequently Asked Questions',
      title: 'We Answer your Questions about GestivaOne',
      subtitle: 'Everything you need to know before getting started.',
    },
    trust: {
      tag: 'Commitment to Security & Trust',
      title: 'Transparency and Guaranteed Security for your Business',
      desc: 'We protect your business data using the highest industry technology standards.',
      sslTitle: 'Bank-Grade SSL/TLS Encryption',
      sslDesc: 'All commercial and financial data is transmitted under end-to-end cloud encryption.',
      supportTitle: 'Local Infrastructure & Support',
      supportDesc: 'Personalized technical support from Barranquilla, Colombia for regional SMEs and merchants.',
      uptimeTitle: '99.9% Uptime & Continuous Backups',
      uptimeDesc: 'High-availability servers with automated backups ensuring zero data loss.',
      dianTitle: 'Tax Compliance',
      dianDesc: 'Platform fully compliant with tax standards, PDF formatting, and electronic invoicing.',
    },
    prefooter: {
      title: 'Be GestivaOne',
      desc: 'Join thousands of merchants and companies automating sales, inventory, and electronic invoicing.',
      btn: 'Start managing now',
    },
    footer: {
      colombia: 'Born in Colombia',
      colProducts: 'Products',
      colResources: 'Resources',
      colLegal: 'Legal',
      colSocial: 'Social Networks',
      rights: 'All rights reserved.',
    },
  },
  pt: {
    nav: {
      features: 'Funcionalidades',
      about: 'Sobre Nós',
      pricing: 'Preços',
      contact: 'Contato',
      marketplace: 'Marketplace',
      start: 'Começar Gestão',
      login: 'Entrar',
      menu: 'Menu',
      ecosystem: 'Ecossistema',
      moreProducts: 'Mais produtos Gestiva',
    },
    hero: {
      badge: 'Plataforma Integral de Gestão Comercial',
      title1: 'Controle Total do seu',
      title2: 'Negócio em Um Só Lugar',
      desc: 'A plataforma moderna que você precisa para automatizar estoques, faturamento, cobranças, relatórios financeiros e muito mais.',
      ctaPrimary: 'Comece Sua Gestão Grátis',
      ctaSecondary: 'Ver Funcionalidades',
      trustMicro: 'Sem cartão de crédito • Configuração em 1 min • Plano grátis',
    },
    family: {
      title: 'Família GestivaOne',
      subtitle: 'Quer fazer parte da nossa comunidade empresarial?',
      cta: 'Junte-se à família',
    },
    features: {
      tag: 'Módulos e Soluções',
      title: 'Tudo o que sua Empresa Precisa para Crescer',
      subtitle: 'Ferramentas projetadas para agilizar a operação diária do seu negócio.',
      posTitle: 'Ponto de Venda (POS)',
      posDesc: 'Faturamento rápido e intuitivo para vendas de balcão e código de barras.',
      invTitle: 'Estoque Inteligente',
      invDesc: 'Controle de estoque em tempo real, alertas de estoque mínimo e rastreabilidade.',
      dianTitle: 'Faturamento Eletrônico DIAN',
      dianDesc: 'Emissão direta de faturas e notas de crédito validadas com autoridades fiscais.',
      analyticsTitle: 'Relatórios e Analítica',
      analyticsDesc: 'Estatísticas financeiras, fluxo de caixa e rentabilidade de produtos instantâneos.',
      crmTitle: 'CRM e Clientes',
      crmDesc: 'Gestão de contas a receber, histórico de compras e integração com WhatsApp.',
      restaurantTitle: 'Módulo Restaurantes',
      restaurantDesc: 'Comandas digitais, controle de mesas e fichas técnicas para gastronomia.',
    },
    usecases: {
      tag: 'Casos de Uso',
      title: 'Adaptado à Indústria do seu Negócio',
      subtitle: 'Descubra como o GestivaOne transforma a gestão de cada setor.',
    },
    geo: {
      tag: 'Infraestrutura & Tecnologia',
      title: 'Tecnologia Robusta para Sua Empresa',
      subtitle: 'Infraestrutura em nuvem, hardware POS e integrações financeiras prontas para operar.',
    },
    faq: {
      tag: 'Perguntas Frequentes',
      title: 'Respondemos às suas Dúvidas sobre o GestivaOne',
      subtitle: 'Tudo o que você precisa saber antes de começar.',
    },
    trust: {
      tag: 'Compromisso de Segurança e Confiança',
      title: 'Transparência e Segurança Garantida para o seu Negócio',
      desc: 'Protegemos os dados da sua empresa com os mais altos padrões tecnológicos.',
      sslTitle: 'Criptografia SSL/TLS de Nível Bancário',
      sslDesc: 'Todas as informações comerciais e financeiras transitam com criptografia de ponta a ponta.',
      supportTitle: 'Suporte e Infraestrutura Local',
      supportDesc: 'Atendimento técnico personalizado a partir de Barranquilla, Colômbia para PMEs e comerciantes.',
      uptimeTitle: '99,9% Uptime & Backups Contínuos',
      uptimeDesc: 'Servidores de alta disponibilidade com cópias de segurança automatizadas.',
      dianTitle: 'Conformidade Fiscal',
      dianDesc: 'Plataforma totalmente adaptada às exigências fiscais e faturamento eletrônico.',
    },
    prefooter: {
      title: 'Seja GestivaOne',
      desc: 'Junte-se a milhares de comerciantes e empresas que já automatizaram suas vendas e faturamento.',
      btn: 'Começar gestão',
    },
    footer: {
      colombia: 'Nascemos na Colômbia',
      colProducts: 'Produtos',
      colResources: 'Recursos',
      colLegal: 'Legal',
      colSocial: 'Redes Sociais',
      rights: 'Todos os direitos reservados.',
    },
  },
}

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      currentLang: 'es',
      setLanguage: (code) => set({ currentLang: code }),
      t: (keyPath) => {
        const lang = get().currentLang
        const keys = keyPath.split('.')
        let res = TRANSLATIONS[lang] || TRANSLATIONS['es']
        for (const k of keys) {
          if (res && res[k] !== undefined) {
            res = res[k]
          } else {
            return keyPath
          }
        }
        return res
      },
    }),
    {
      name: 'gestiva_lang_store',
    }
  )
)
