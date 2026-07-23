/**
 * Data configuration for Scrollytelling Section Engine
 * Supports infinite scalability (4, 6, 8, 12+ modules)
 */

export const getLandingModulesData = (t) => [
  {
    id: 'inventario',
    moduleKey: 'inv',
    icon: 'ShoppingCart',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
    accentColor: '#10b981', // Emerald
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-emerald-900/10',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    badge: 'Módulo Activo • GestivaOne',
    title: t('features.invTitle') || 'Inventario Inteligente',
    desc: t('features.invDesc') || 'Control de existencias en tiempo real, alertas de stock mínimo y trazabilidad completa de insumos.',
    tags: ['Stock Real', 'Alertas Mínimas', 'Multisede', 'Código de Barras'],
    metric: 'Incluido en Pro',
    submetric: 'Gestión 100% en Nube',
    ctaText: 'Explorar Inventario',
    ctaLink: '#inventario',
    mockupType: 'inventory',
    mockupData: {
      totalProducts: '1,420',
      activeAlerts: '3 Productos Bajos',
      recentMovement: '+45 Unidades registradas'
    }
  },
  {
    id: 'pos',
    moduleKey: 'pos',
    icon: 'Printer',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/10',
    accentColor: '#6366f1', // Indigo
    gradientFrom: 'from-indigo-500/20',
    gradientTo: 'to-indigo-900/10',
    glowColor: 'rgba(99, 102, 241, 0.15)',
    badge: 'POS Térmico Rápido • GestivaOne',
    title: t('features.posTitle') || 'Punto de Venta (POS)',
    desc: t('features.posDesc') || 'Facturación ultra rápida e intuitiva para ventas de mostrador, tickets térmicos y cajas rápidas.',
    tags: ['Tickets 58/80mm', 'Bluetooth & USB', 'Impresión 3 seg', 'Multidispositivo'],
    metric: 'Multidispositivo',
    submetric: 'Sin retrasos de impresión',
    ctaText: 'Probar Punto de Venta',
    ctaLink: '#pos',
    mockupType: 'pos',
    mockupData: {
      speed: '3 Segundos / Ticket',
      compatibility: 'ESC/POS 58mm & 80mm',
      offlineMode: 'Sincronización Automática'
    }
  },
  {
    id: 'crm',
    moduleKey: 'crm',
    icon: 'MessageSquare',
    iconBg: 'bg-brand-500/10 text-brand-400 border-brand-500/20 shadow-brand-500/10',
    accentColor: '#8b5cf6', // Brand Purple
    gradientFrom: 'from-brand-500/20',
    gradientTo: 'to-brand-900/10',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    badge: 'CRM & Notificaciones • GestivaOne',
    title: t('features.crmTitle') || 'CRM & Notificaciones Automáticas',
    desc: t('features.crmDesc') || 'Gestión de cartera, historial de compras de clientes y despachos automáticos por WhatsApp Business.',
    tags: ['WhatsApp Business', 'Cartera', 'SMTP Directo', 'Recordatorios'],
    metric: 'Recaudos Rápidos',
    submetric: 'Cobro Automático en Nube',
    ctaText: 'Ver Automatizaciones',
    ctaLink: '#crm',
    mockupType: 'crm',
    mockupData: {
      messagesSent: '99.4% Entregados',
      channel: 'WhatsApp Business API',
      automation: 'Cobros Programados'
    }
  },
  {
    id: 'analytics',
    moduleKey: 'analytics',
    icon: 'BarChart3',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/10',
    accentColor: '#a855f7', // Purple
    gradientFrom: 'from-purple-500/20',
    gradientTo: 'to-purple-900/10',
    glowColor: 'rgba(168, 85, 247, 0.15)',
    badge: 'Analítica Financiera • GestivaOne',
    title: t('features.analyticsTitle') || 'Reportes & Analítica en Tiempo Real',
    desc: t('features.analyticsDesc') || 'Estadísticas financieras instantáneas, estados de flujo de caja, cierres de caja y rentabilidad de productos.',
    tags: ['PDF & Excel', 'Flujo de Caja', 'Utilidades', 'Exportación 1-Click'],
    metric: 'Reportes 1 Click',
    submetric: 'Cierres de Caja Precisos',
    ctaText: 'Ver Reportes Demo',
    ctaLink: '#analytics',
    mockupType: 'analytics',
    mockupData: {
      margin: '42.8% Margen Bruto',
      growth: '+28.5% este mes',
      exportFormats: 'PDF, XLSX & CSV'
    }
  },
  {
    id: 'dian',
    moduleKey: 'dian',
    icon: 'Users',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10',
    accentColor: '#f59e0b', // Amber
    gradientFrom: 'from-amber-500/20',
    gradientTo: 'to-amber-900/10',
    glowColor: 'rgba(245, 158, 11, 0.15)',
    badge: 'DIAN & Normativo • GestivaOne',
    title: t('features.dianTitle') || 'Facturación Electrónica DIAN',
    desc: t('features.dianDesc') || 'Emisión directa de facturas y notas crédito validadas ante la entidad tributaria con soporte normativo 100% legal.',
    tags: ['100% Normativo', 'Cifrado SSL', 'Notas Crédito', 'Validación DIAN'],
    metric: 'Validado DIAN',
    submetric: 'Seguridad Nivel Bancario',
    ctaText: 'Ver Cumplimiento DIAN',
    ctaLink: '#dian',
    mockupType: 'dian',
    mockupData: {
      status: 'Validado DIAN OK',
      xmlStatus: 'XML & CUFE Generado',
      security: 'SSL / TLS Encrypted'
    }
  },
  {
    id: 'restaurant',
    moduleKey: 'restaurant',
    icon: 'TrendingUp',
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10',
    accentColor: '#f43f5e', // Rose
    gradientFrom: 'from-rose-500/20',
    gradientTo: 'to-rose-900/10',
    glowColor: 'rgba(244, 63, 94, 0.15)',
    badge: 'Gastronomía & POS • GestivaOne',
    title: t('features.restaurantTitle') || 'Módulo Especializado Gastronomía',
    desc: t('features.restaurantDesc') || 'Comandas digitales para cocina, gestión de mesas en tiempo real, costeo de recetas y menú QR virtual.',
    tags: ['Comandas Cocina', 'Recetas & Costeo', 'Control Mesas', 'Menú QR'],
    metric: 'Módulo Gourmet',
    submetric: 'Menú Virtual Integrado',
    ctaText: 'Probar Módulo Gourmet',
    ctaLink: '#restaurant',
    mockupType: 'gourmet',
    mockupData: {
      activeTables: '14 Mesas Ocupadas',
      kitchenQueue: '4 Comandas en Preparación',
      menuQr: 'Activo & Digital'
    }
  }
]
