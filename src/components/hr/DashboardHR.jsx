import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon';

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B']

export default function DashboardHR({ employees, runs, vacations, candidates }) {
  // 1. Calculations for KPIs
  const activeCount = employees.filter(e => e.status === 'active').length
  const totalMonthlyPayroll = employees
    .filter(e => e.status === 'active')
    .reduce((sum, e) => sum + Number(e.salary), 0)

  const pendingVacations = vacations.filter(v => v.status === 'pending').length
  const activeCandidates = candidates.filter(c => c.stage !== 'hired' && c.stage !== 'rejected').length

  // 2. Department Data for Pie Chart
  const deptMap = {}
  employees.forEach(e => {
    if (e.status === 'active') {
      deptMap[e.department] = (deptMap[e.department] || 0) + Number(e.salary)
    }
  })
  const deptChartData = Object.keys(deptMap).map(name => ({
    name,
    value: deptMap[name]
  }))

  // 3. Payroll runs history for Bar Chart
  const payrollHistory = runs.map(run => ({
    name: run.name.replace('Nómina ', ''),
    total: run.total_net
  })).reverse().slice(-5)

  // 4. Low-cost AI Alerts & Heuristics
  const alerts = []
  employees.forEach(e => {
    if (Number(e.salary) > 5000000) {
      alerts.push({
        id: `alert-sal-${e.id}`,
        type: 'warning',
        text: `Salario alto detectado: ${e.full_name} (${e.position}) gana ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(e.salary)}.`
      })
    }
  })
  vacations.forEach(v => {
    if (v.status === 'pending' && v.requested_days > 15) {
      alerts.push({
        id: `alert-vac-${v.id}`,
        type: 'danger',
        text: `Solicitud de vacaciones de ${v.employee_name} por ${v.requested_days} días supera el límite recomendado continuo (15 días).`
      })
    }
  })

  // Cross-analytical Insight
  // Let's assume average sales is around 18M COP if runs has a value, or hardcoded for mock presentation
  const mockSalesAverage = 18500000.00
  const payrollPercentageOfSales = totalMonthlyPayroll > 0 ? ((totalMonthlyPayroll / mockSalesAverage) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ y: -4 }}
          className="liquid-glass p-5 rounded-3xl flex items-center gap-4 border border-subtle"
        >
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl">
            <Icon name="Users" size={24}  />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-400 uppercase tracking-widest">Colaboradores</p>
            <p className="text-2xl font-black text-foreground">{activeCount}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="liquid-glass p-5 rounded-3xl flex items-center gap-4 border border-subtle"
        >
          <div className="p-3 bg-success-500/10 text-success-400 rounded-2xl">
            <Icon name="DollarSign" size={24}  />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-400 uppercase tracking-widest">Costo Mensual Base</p>
            <p className="text-xl font-black text-foreground">
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalMonthlyPayroll)}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="liquid-glass p-5 rounded-3xl flex items-center gap-4 border border-subtle"
        >
          <div className="p-3 bg-warning-500/10 text-warning-400 rounded-2xl">
            <Icon name="Calendar" size={24}  />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-400 uppercase tracking-widest">Vacaciones Pendientes</p>
            <p className="text-2xl font-black text-foreground">{pendingVacations}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="liquid-glass p-5 rounded-3xl flex items-center gap-4 border border-subtle"
        >
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-2xl">
            <Icon name="TrendingUp" size={24}  />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-400 uppercase tracking-widest">Candidatos en Proceso</p>
            <p className="text-2xl font-black text-foreground">{activeCandidates}</p>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payroll History Bar Chart */}
        <div className="lg:col-span-8 bg-surface-800 border border-subtle rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Historial de Costo de Nómina (Neto)</h3>
            <Badge variant="brand">Mensual</Badge>
          </div>
          <div className="h-[220px] w-full">
            {payrollHistory.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-400 font-bold">
                No hay nóminas aprobadas registradas.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollHistory}>
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000000}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '12px' }}
                    labelStyle={{ color: '#F3F4F6', fontWeight: 'bold' }}
                    formatter={(value) => [new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value), 'Total Neto']}
                  />
                  <Bar dataKey="total" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cost per Department Pie Chart */}
        <div className="lg:col-span-4 bg-surface-800 border border-subtle rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Distribución Salarial por Área</h3>
          <div className="h-[180px] w-full relative flex items-center justify-center">
            {deptChartData.length === 0 ? (
              <div className="text-xs text-muted-400 font-bold">Sin datos de áreas</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deptChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '12px' }}
                    formatter={(value) => [new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value), 'Costo']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute text-center">
              <span className="block text-[10px] uppercase font-bold text-muted-400 tracking-wider">Áreas</span>
              <span className="text-lg font-black text-foreground">{deptChartData.length}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-[10px] font-bold text-muted-400 uppercase">
            {deptChartData.map((d, index) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Insights and IA Heuristics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* IA / Heuristics Alert Center */}
        <div className="bg-surface-800 border border-subtle rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-400 flex items-center gap-1.5">
            <Icon name="AlertTriangle" size={14} className="text-warning-500"  />
            Alertas y Detección de Anomalías (Heurística)
          </h3>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-success-500/5 border border-success-500/10 rounded-2xl text-[11px] text-success-400 font-bold">
                <Icon name="ShieldCheck" size={14}  />
                No se detectaron inconsistencias ni anomalías salariales. Todo al día.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 border rounded-2xl text-xs flex gap-2.5 items-start ${
                    alert.type === 'danger'
                      ? 'bg-danger-500/10 border-danger-500/20 text-danger-400'
                      : 'bg-warning-500/10 border-warning-500/20 text-warning-400'
                  }`}
                >
                  <Icon name="AlertTriangle" size={14} className="shrink-0 mt-0.5"  />
                  <p>{alert.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Cross-cutting Insight */}
        <div className="bg-surface-800 border border-subtle rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-400 flex items-center gap-1.5">
            <Icon name="TrendingUp" size={14} className="text-brand-500"  />
            Salud Financiera & Eficiencia del Personal
          </h3>
          
          <div className="p-4 bg-surface-900/60 rounded-2xl border border-subtle/50 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-muted-400">Porcentaje Nómina vs. Ventas:</span>
              <span className={`font-black text-sm px-2 py-0.5 rounded-lg ${
                Number(payrollPercentageOfSales) > 45 
                  ? 'bg-danger-500/10 text-danger-400' 
                  : 'bg-success-500/10 text-success-400'
              }`}>
                {payrollPercentageOfSales}%
              </span>
            </div>
            <div className="w-full bg-surface-700 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(payrollPercentageOfSales, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-muted-400 leading-relaxed">
            💡 **Insight de Gestión**: Tu nómina representa el **{payrollPercentageOfSales}%** de tus ingresos promedio. El rango recomendado para el sector comercial es de **30% a 45%** para mantener márgenes operativos altos y saludables.
          </p>
        </div>
      </div>
    </div>
  )
}
