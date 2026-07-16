# Contexto Maestro - GestivaOne

Este archivo es la fuente de contexto del proyecto. Cada funcionalidad, decision de producto o cambio importante debe sumarse aqui de forma breve para que cualquier IA o colaborador entienda el norte sin perder tiempo.

## Identidad

GestivaOne es un SaaS de gestion comercial, operativa y financiera para negocios. Su proposito es ayudar a pequenos comercios, emprendedores y empresas en crecimiento a controlar ventas, inventario, trabajadores, clientes, facturacion, cobros, egresos y reportes desde una sola plataforma en la nube.

Propuesta central: convertir la operacion diaria del negocio en informacion clara para tomar decisiones en tiempo real.

## Valor Aniadido

- Unifica gestion de inventario, ventas, facturacion, cartera, gastos, trabajadores y finanzas en una sola app.
- Reduce la carga operativa de negocios que no tienen equipo contable o sistemas empresariales complejos.
- Permite operar por roles: administrador, despachador y contable.
- Genera reportes financieros y exportaciones PDF/Excel para analisis y control.
- Integra herramientas practicas para Colombia, incluyendo asistente DIAN, reportes de informacion exogena y manejo de IVA/retenciones.
- Maneja alertas preventivas: stock bajo, facturas pendientes, vencimientos y notificaciones.
- Conecta la utilidad del negocio con bolsillos de ahorro y gestion financiera personal.
- CRM con segmentacion automatica de clientes y campanas de email drag & drop.
- Modulo HR completo: nomina colombiana, candidatos (Kanban), vacaciones, organigrama.
- GestiToken: autenticacion 2FA tipo TOTP para seguridad de operaciones criticas.
- Sistema multi-moneda con tasas en tiempo real (fxfeed.io).
- Impresion termica de recibos (80mm/58mm) con templates classic y modern.

## Usuario Objetivo

- Tiendas, minimercados, restaurantes, servicios, comercios locales y negocios digitales que necesitan orden operativo.
- Emprendedores que quieren facturar, controlar inventario y saber si ganan o pierden.
- Negocios con trabajadores que requieren permisos diferenciados.
- Empresas pequenas que necesitan reportes sin implementar un ERP pesado.

## Modulos Actuales

### Publicos
- **Landing** (`Landing.jsx`): comunica valor, caracteristicas, planes y contacto.
- **Auth** (`Auth.jsx`): registro, inicio de sesion, acceso por trabajador e invitaciones. Incluye flujo de seleccion de pais, formulario de empresa, selector de plan y formulario de pago. Componentes: `CompanyForm`, `PlanSelector`, `PaymentForm`.
- **Terms** (`Terms.jsx`): politica de privacidad, seguridad y condiciones del servicio.

### Core de Negocio
- **Dashboard** (`Dashboard.jsx`, ~1734 lineas): vista general del negocio con KPIs (ingresos, egresos, utilidad, cartera), graficas interactivas (AreaChart, BarChart, PieChart, LineChart via recharts), analisis de clientes, productos top, tendencias mensuales, bolsillos y accesos rapidos. Consume datos de invoices, clients, products, expenses, pockets y currency stores.
- **Menu/Ventas** (`Menu.jsx`): flujo POS para vender productos y generar ordenes/facturas. Incluye seleccion de cliente, busqueda, filtros, historial y panel lateral de factura (`InvoicePanel`). Soporta tipos de documento (CC, NIT, CE, PAS).
- **Productos/Inventario** (`Products.jsx`): gestion de productos, precios, categorias, IVA y stock. Modales para crear/editar/duplicar productos (`AddProductModal`). Soporte de unidades ilimitadas (servicios).
- **Facturero** (`Facturero.jsx`, ~61k bytes): creacion de facturas, recibos y documentos imprimibles. Exportacion individual a PDF con templates corporativo y minimalista. Impresion termica de tickets.

### CRM y Comunicaciones
- **CRM** (`CRM.jsx`): modulo de gestion de relaciones con clientes. Segmentacion automatica (VIP, Activo, Tibio, Inactivo, Nuevo) basada en frecuencia y volumen de compras. Detalle 360 del cliente con historial de actividades, metricas de consumo, timeline de interacciones. Store: `useCRMStore` (actividades en tabla `crm_activities`).
- **Emails/Campanas** (`Emails.jsx`, ~977 lineas): compositor de campanas de email con editor visual drag & drop (bloques: titulo, texto, imagen, boton, link, tabla de factura). Layouts predefinidos (promo, VIP, reactivacion). Segmentacion de destinatarios. Preview en tiempo real. Envio masivo via `sendCustomCampaignEmail`. Usa `@hello-pangea/dnd` para drag & drop.

### Recursos Humanos
- **Empleados** (`Employees.jsx`): gestion de trabajadores con 6 sub-modulos:
  - `DashboardHR`: metricas de empleados, contrataciones, nomina.
  - `CandidatesKanban`: pipeline de reclutamiento con columnas (Applied, Interview, Offer, Hired).
  - `OrgChart`: organigrama visual del equipo.
  - `VacationsPanel`: solicitudes de vacaciones, aprobacion/rechazo.
  - `PayrollPanel`: ejecucion de nomina, conceptos de ley colombiana (salud, pension, ARL, aux. transporte).
  - `EmployeeDetail360`: detalle completo del empleado con info bancaria, historial.
- Stores: `useHRStore` (employees, candidates, vacations), `usePayrollStore` (runs, concepts, nomina colombiana con formulas de ley), `useEmployeeStore` (invitaciones, roles).

### Finanzas
- **Bolsillos** (`Pockets.jsx`): separacion de dinero por metas, ahorro o reglas de uso.
- **Mi Gestion** (`PersonalFinance.jsx`): finanzas personales, retiros desde utilidad, prestamos por cobrar/pagar y gastos personales.
- **Asistente DIAN** (`DianAssistant.jsx`): simulaciones y soportes tributarios basados en facturas y egresos.

### Seguridad y Cuenta
- **GestiToken** (`GestiToken.jsx`): generador de codigos OTP tipo TOTP. Codigo de 6 digitos que rota cada 60 segundos, basado en epoch + hash del companyId (LCG seed). Toggle para activar/desactivar. Configuracion de duracion de sesion OTP. Progreso circular animado.
- **Cuenta** (`Account.jsx`): perfil, empresa, seguridad y preferencias del usuario.
- **Datos y respaldo**: desde Cuenta permite exportar la informacion de gestion a Excel, importar ese mismo formato y limpiar datos operativos (`accountDataService.js`).

### Configuracion
- **Settings** (`Settings.jsx`, ~1388 lineas): datos de empresa, seleccion de moneda, tema (dark/light/system), configuracion de impresion termica (templates, logo, datos de contacto), configuracion de correos automaticos (Resend), exportaciones PDF/Excel, respaldo de datos, conexion a Supabase status.

### Monetizacion
- **Upgrade** (`Upgrade.jsx`): pagina de planes con comparativa detallada. 3 planes base (Standard, Pro, 360) + addons individuales comprables (CRM $5.000, Campanas Email $8.000, Facturero $7.000, Asistente DIAN $4.000, GestiToken $3.000, Mi Gestion $5.000, Bolsillos $4.000). Simulacion de checkout con referencia de pago.

### Notificaciones
- **Notificaciones** (`Notifications.jsx`): alertas operativas y recordatorios.

## Modelo de Negocio

Planes actuales:

- **One Standard**: gratis, 1 trabajador, facturacion basica, clientes e inventario limitado.
- **One Pro**: $32.000/mes (promo $7.000 primer mes), hasta 10 trabajadores, dashboard avanzado, empleados y reportes PDF/Excel.
- **One 360**: $120.000/mes (promo $80.000 primeros 3 meses), hasta 30 trabajadores, multi-sucursal, API personalizada, soporte dedicado y SLA 99.9%.
- **Enterprise**: precio personalizado, trabajadores ilimitados, desarrollo a medida, infraestructura dedicada.
- **Master Admin**: acceso interno total.

Addons comprables individualmente: CRM ($5.000), Campanas Email ($8.000), Facturero ($7.000), DIAN ($4.000), GestiToken ($3.000), Mi Gestion ($5.000), Bolsillos ($4.000).

La monetizacion se basa en suscripciones con limites por plan, addons a la carta y features avanzadas.

## Roles y Permisos

- **Administrador**: acceso completo a dashboard, menu, productos, configuracion, empleados y cuenta.
- **Despachador**: opera ventas/menu/productos y cuenta; no accede a dashboard, configuracion ni empleados.
- **Contable**: accede a dashboard y cuenta; no opera menu/productos/configuracion/empleados.
- **Master**: acceso total sin restricciones (interno).

Regla de producto: los roles deben proteger informacion sensible y reducir errores operativos.

### Guards de Acceso (App.jsx)
- `RequireAuth`: redirige a `/auth` si no autenticado.
- `RequirePermission`: valida permisos del rol (`perm`) contra la matriz `ROLES[role].permissions`.
- `RequireFeature`: valida acceso por plan o addon comprado (`user.settings.purchased_features`). Si no tiene acceso, redirige a `/upgrade`.

Features protegidas por `RequireFeature`: employees, pockets, personal-finance, facturero, dian, seguridad, crm, emails.

## Arquitectura Actual

### Stack
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS.
- **Estado**: Zustand con persistencia (localStorage y IndexedDB via `idb-keyval`).
- **Backend/datos**: Supabase Auth, Supabase Realtime y tablas de negocio.
- **Edge Functions**: Supabase Edge Functions para envio de emails via Resend API (`resend-email`).
- **UI**: lucide-react, framer-motion, react-hot-toast, recharts, clsx.
- **Formularios/validacion**: react-hook-form, zod.
- **Drag & Drop**: `@hello-pangea/dnd` (usado en Emails builder).
- **Fechas**: date-fns con locale `es`.
- **Exportacion**: jsPDF, jspdf-autotable, xlsx.
- **Analytics**: `@vercel/analytics`, `@vercel/speed-insights`, tracking custom (`lib/analytics.js` → tabla `events` en Supabase).
- **Multi-moneda**: API fxfeed.io con cache 24h y fallback local.
- **Despliegue**: Vercel.

### Estructura de Archivos

```
src/
├── App.jsx                  # Router principal, guards, version cache purge
├── main.jsx                 # Entry point
├── index.css                # Estilos globales + design tokens
├── components/
│   ├── Section.jsx          # Wrapper de seccion generico
│   ├── auth/
│   │   ├── CompanyForm.jsx  # Formulario de datos de empresa (onboarding)
│   │   ├── PaymentForm.jsx  # Formulario de pago (onboarding)
│   │   └── PlanSelector.jsx # Selector de plan (onboarding)
│   ├── hr/
│   │   ├── CandidatesKanban.jsx  # Pipeline de reclutamiento
│   │   ├── DashboardHR.jsx       # Metricas de RRHH
│   │   ├── EmployeeDetail360.jsx # Detalle completo empleado
│   │   ├── OrgChart.jsx          # Organigrama visual
│   │   ├── PayrollPanel.jsx      # Panel de nomina
│   │   └── VacationsPanel.jsx    # Panel de vacaciones
│   ├── invoice/
│   │   └── InvoicePanel.jsx      # Panel lateral de factura en Menu
│   ├── layout/
│   │   ├── AppLayout.jsx    # Layout principal con sidebar
│   │   ├── Sidebar.jsx      # Navegacion lateral (~32k bytes)
│   │   └── TopBar.jsx       # Barra superior
│   ├── modals/
│   │   ├── AddClientModal.jsx       # Crear/editar cliente
│   │   ├── AddProductModal.jsx      # Crear/editar producto
│   │   ├── ClientHistoryModal.jsx   # Historial de cliente
│   │   ├── CountrySelectorModal.jsx # Selector de pais/moneda
│   │   └── OrderConfirmModal.jsx    # Confirmacion de orden
│   └── ui/
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── CookieBanner.jsx      # Banner de cookies GDPR
│       ├── Input.jsx
│       ├── KPICard.jsx           # Tarjeta KPI animada
│       ├── Modal.jsx
│       ├── ScrollIndicator.jsx
│       ├── SearchBar.jsx
│       └── SortFilterBar.jsx
├── hooks/
│   └── useRealtimeSync.js  # Supabase Realtime: sincroniza products, clients, invoices, expenses, profiles
├── lib/
│   ├── analytics.js     # trackEvent() → tabla events en Supabase (fire & forget)
│   ├── idbStorage.js    # Adapter IndexedDB para Zustand persist (idb-keyval)
│   └── supabase.js      # Cliente Supabase
├── pages/
│   ├── Account.jsx
│   ├── Auth.jsx             # Login, registro, invitacion, onboarding completo
│   ├── CRM.jsx              # CRM con segmentacion automatica
│   ├── Dashboard.jsx        # Dashboard analitico avanzado
│   ├── DianAssistant.jsx    # Asistente tributario DIAN
│   ├── Emails.jsx           # Campanias email drag & drop
│   ├── Employees.jsx        # RRHH con 6 sub-paneles
│   ├── Facturero.jsx        # Facturacion y documentos
│   ├── GestiToken.jsx       # 2FA OTP generator
│   ├── Landing.jsx          # Pagina publica
│   ├── Menu.jsx             # POS / punto de venta
│   ├── Notifications.jsx
│   ├── PersonalFinance.jsx  # Finanzas personales
│   ├── Pockets.jsx          # Bolsillos de ahorro
│   ├── Products.jsx         # Inventario
│   ├── Settings.jsx         # Configuracion completa
│   ├── Terms.jsx
│   └── Upgrade.jsx          # Planes y addons
├── services/
│   ├── accountDataService.js   # Backup/import/clean de datos de cuenta
│   ├── emailService.js         # 13 funciones de envio via Resend Edge Function
│   ├── emailTemplates.js       # Templates HTML para cada tipo de email (~40k bytes)
│   ├── exportService.js        # PDF y Excel para facturas, clientes, productos, factura individual
│   └── printService.js         # Impresion termica (classic/modern, 80mm/58mm)
└── store/
    ├── useAuthStore.js       # Auth, sesion, perfil, planes, roles, PLANS, ROLES
    ├── useCartStore.js       # Carrito del POS: items, impuestos, cargos custom, descuento global
    ├── useClientStore.js     # CRUD clientes con Supabase
    ├── useCRMStore.js        # Actividades CRM (tabla crm_activities)
    ├── useCurrencyStore.js   # Multi-moneda: 15 monedas, API fxfeed, cache, fallback
    ├── useEmployeeStore.js   # Invitaciones y workers
    ├── useExpenseStore.js    # Egresos
    ├── useHRStore.js         # HR: employees, candidates, vacations (mock + Supabase)
    ├── useInvoiceStore.js    # Facturas, abonos, estados, cartera
    ├── useNotificationStore.js # Notificaciones
    ├── usePayrollStore.js    # Nomina colombiana: conceptos de ley, runs, calculo de formulas
    ├── usePocketStore.js     # Bolsillos
    ├── useProductStore.js    # Productos con descuentos
    ├── useSettingsStore.js   # Settings de empresa, impresion, emails
    └── useUIStore.js         # Sidebar, theme, modales, panel de factura
```

### Stores (Estado Global - Zustand)

| Store | Persistencia | Descripcion |
|---|---|---|
| `useAuthStore` | localStorage | Auth, sesion, perfil, planes, roles. Version key: `gestiva-auth-v2.2` |
| `useCartStore` | No | Carrito del POS, calculos de impuestos multi-moneda, cargos custom |
| `useClientStore` | IDB | CRUD clientes con Supabase sync |
| `useCRMStore` | IDB | Actividades CRM, stale time 1h |
| `useCurrencyStore` | localStorage | Moneda base, tasas, cache 24h |
| `useEmployeeStore` | IDB | Workers e invitaciones |
| `useExpenseStore` | IDB | Egresos |
| `useHRStore` | IDB | Empleados HR, candidatos, vacaciones. Mock data para offline |
| `useInvoiceStore` | IDB | Facturas, abonos, cartera, checkOverdue |
| `useNotificationStore` | localStorage | Alertas |
| `usePayrollStore` | IDB | Nomina: runs, conceptos de ley, evaluador de formulas safe |
| `usePocketStore` | IDB | Bolsillos de ahorro |
| `useProductStore` | IDB | Productos con descuentos |
| `useSettingsStore` | localStorage | Settings empresa, impresion, emails Resend |
| `useUIStore` | localStorage | Sidebar, theme, modales |

### Servicios

| Servicio | Funciones principales |
|---|---|
| `emailService.js` | `sendInvoiceEmail`, `sendOverdueEmail`, `sendPaymentConfirmEmail`, `sendWelcomeEmail`, `sendWorkerInviteEmail`, `sendWeeklyReportEmail`, `sendResetWorkspaceEmail`, `sendTestEmail`, `sendExpenseEmail`, `sendNewClientEmail`, `sendLowStockEmail`, `sendNewEmployeeEmail`, `sendVerificationCodeEmail`, `sendCustomCampaignEmail` |
| `emailTemplates.js` | Templates HTML para cada tipo: `invoiceTemplate`, `overdueTemplate`, `paymentConfirmTemplate`, `welcomeTemplate`, `workerInviteTemplate`, `weeklyReportTemplate`, `resetWorkspaceTemplate`, `testEmailTemplate`, `expenseRegisteredTemplate`, `newClientTemplate`, `lowStockTemplate`, `newEmployeeTemplate`, `verificationCodeTemplate` |
| `exportService.js` | `exportInvoicesPDF/Excel`, `exportClientsPDF/Excel`, `exportProductsPDF/Excel`, `exportSingleInvoicePDF` (con themes de color y template minimalist/corporativo) |
| `printService.js` | `printInvoice` (templates: classic/modern, 80mm/58mm, con logo, contacto, IVA) |
| `accountDataService.js` | `exportAccountBackup`, `importAccountBackup`, `clearAccountData` |

### Sincronizacion en Tiempo Real

`useRealtimeSync.js` suscribe a Supabase Realtime por `company_id`:
- Tablas: `products`, `clients`, `invoices`, `expenses`, `profiles`.
- Cada cambio dispara `applyRealtimeUpdate()` en el store correspondiente.
- Cambios en el perfil del usuario actual sincronizan auth y pockets.

## Datos Principales

Entidades clave (tablas Supabase):

- **companies**: empresa, pais, moneda, logo y settings.
- **profiles**: usuario, rol, plan, empresa, permisos, sesion activa, `settings` (purchased_features, gestibot_otp_enabled/duration).
- **products**: inventario/productos con descuentos.
- **clients**: clientes con tipo de documento (CC, NIT, CE, PAS).
- **invoices**: facturas/ventas/cartera con items (JSON), abonos, estados (paid, pending, overdue, cancelled).
- **expenses**: egresos categorizados.
- **notifications**: alertas operativas.
- **personal_loans**: prestamos personales por cobrar/pagar.
- **pockets**: bolsillos o separaciones de dinero.
- **crm_activities**: actividades CRM (sale, note, call, email, status_change) por client_id.
- **events**: tracking de analytics (fire & forget).
- **hr_employees**: empleados con salario, cargo, departamento, ARL, banco (usado por HR/Nomina).
- **hr_candidates**: pipeline de reclutamiento (applied, interview, offer, hired).
- **hr_vacations**: solicitudes de vacaciones (pending, approved, rejected).
- **payroll_runs**: ejecuciones de nomina con resultados por empleado.

## Reglas de Producto

- El negocio es el centro; cada dato debe estar asociado a una empresa cuando aplique.
- La app debe priorizar claridad financiera: ingresos, gastos, utilidad, deudas y flujo operativo.
- Toda funcion nueva debe responder a una necesidad real de gestion del negocio.
- Las interfaces deben ser densas pero claras, utiles para trabajo diario, no solo visuales.
- Cualquier exportacion debe ser entendible para el dueno del negocio o su contador.
- El producto debe funcionar para usuarios sin experiencia tecnica ni financiera profunda.

## Diferenciadores a Preservar

- Gestion integral sin complejidad de ERP.
- Finanzas del negocio conectadas con finanzas personales.
- Enfoque localizable para Colombia y obligaciones DIAN.
- Roles simples y practicos para equipos pequenos.
- Reportes y documentos listos para imprimir/exportar.
- Experiencia moderna, sobria y confiable.
- CRM y campanas de email integrados nativamente.
- Nomina colombiana con formulas de ley automatizadas.
- Monetizacion modular: plans + addons a la carta.

## Criterios Para Nuevas Funciones

Antes de agregar algo, validar:

- Ayuda a vender, cobrar, controlar inventario, gestionar equipo o entender finanzas.
- Reduce pasos manuales o evita errores.
- Respeta roles, empresa activa y plan del usuario.
- Puede medirse en dashboard, reporte o historial.
- No introduce complejidad innecesaria para comercios pequenos.
- El feature debe estar protegido por `RequireFeature` si es premium.

## Estado Tecnico Importante

- **Version actual**: 2.3 — la app limpia cache/localStorage por version para evitar estados viejos.
- **Cache purge**: al detectar version nueva, purga localStorage (excepto active keys), CacheStorage y Service Workers, luego recarga.
- **Active keys preservadas**: `gestiva-app-version`, `gestiva-auth-v2.2`, `gestiva-currency-v2`, `gestiva-expenses-v2`, `gestiva-notifications`, `gestiva-settings-v2.3`, `gestiva-ui`, `gestiva-cookies-accepted`, `gestiva-remembered-email/password`, `gestiva-remember-me`, `gestiva-active-session-token`, `gestiva-explicit-logout`.
- Standard limita sesiones activas mediante `active_session_id`.
- Trabajadores pueden vincularse por codigo de invitacion, idealmente via RPC `use_invitation_code`.
- Supabase es la fuente principal de autenticacion y datos.
- IndexedDB (`idb-keyval`) se usa para persistencia de stores pesados (productos, clientes, facturas, etc.) evitando limites de localStorage.
- Algunos datos tienen fallback local/mock para resiliencia o modo parcial (especialmente HR y Payroll).
- La gestion de datos de cuenta vive en `accountDataService.js`: respalda productos, clientes, egresos, facturas, abonos, notificaciones, bolsillos/settings y prestamos personales en un Excel multi-hoja; tambien importa el mismo formato y puede limpiar datos de gestion sin borrar usuario ni empresa.
- Egress optimizado: sin polling ni listeners de focus en idle. Auth se mantiene por JWT + `onAuthStateChange`.
- Emails transaccionales via Supabase Edge Functions (`resend-email`) con 14 tipos de email.
- Impresion termica soporta templates classic y modern con configuracion desde Settings.
- Multi-moneda: 15 monedas soportadas, tasas via fxfeed.io con fallback hardcoded, cache 24h.
- Carrito (`useCartStore`) calcula impuestos por moneda (IVA 19% COP, 16% MXN, 21% EUR, etc.), cargos custom y descuento global.
- PDFs de factura individual soportan themes de color (indigo, emerald, blue, rose, amber, slate, hex custom) y template minimalist/corporativo.
- Vercel Analytics y Speed Insights integrados para monitoreo de produccion.
- Titulo de pagina dinamico con efecto de atencion al cambiar de tab (`visibilitychange`).

## Pendientes / Horizonte

- Consolidar README tecnico y guia de instalacion.
- Normalizar textos con codificacion UTF-8 si aparecen caracteres corruptos.
- Confirmar esquema completo de Supabase y documentar tablas/campos.
- Revisar que limites de planes se apliquen de forma consistente en UI y datos.
- Fortalecer flujos de invitacion de trabajadores con backend/Edge Functions si es necesario.
- Migrar HR/Payroll de mock data a tablas reales de Supabase.
- Implementar pagos reales (pasarela) para planes y addons (actualmente simulado).
- Implementar multi-sucursal para plan 360.
- Agregar API publica para plan empresarial.
- Mantener este archivo actualizado en cada cambio de producto o arquitectura.

## Regla de Mantenimiento Para IA

Cuando una IA agregue o modifique funcionalidades relevantes, debe actualizar este archivo con:

- Que se agrego.
- Que problema resuelve.
- Que modulo afecta.
- Si cambia roles, planes, datos, reportes o reglas del negocio.

Mantenerlo breve. No convertirlo en changelog tecnico extenso.

## Registro de Funcionalidades Agregadas (Changelog)

*Aquí se documentarán todas las nuevas funcionalidades que vayamos agregando, manteniendo el contexto actualizado para futuras iteraciones.*

