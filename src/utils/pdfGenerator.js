import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export function generateWeeklyReportPDF(stats, company) {
  const doc = new jsPDF()

  // Título
  doc.setFontSize(20)
  doc.setTextColor(33, 33, 33)
  doc.text(`Reporte Semanal de Ventas`, 14, 22)

  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(`${company.companyName || 'GestivaOne'} - ${stats.periodLabel}`, 14, 30)

  // Tabla principal de Resumen
  doc.autoTable({
    startY: 40,
    head: [['Métrica', 'Valor']],
    body: [
      ['Ingresos Reales (Facturas Pagadas)', `$${stats.totalRevenue.toLocaleString('es-CO')}`],
      ['Total de Facturas Emitidas', stats.totalInvoices.toString()],
      ['Facturas Pagadas', stats.paidInvoices.toString()],
      ['Facturas Pendientes', stats.pendingInvoices.toString()],
      ['Facturas Vencidas', stats.overdueInvoices.toString()],
      ['Nuevos Clientes', stats.newClients.toString()]
    ],
    theme: 'striped',
    headStyles: { fillColor: [67, 56, 202] }, // Brand color
    margin: { top: 10 }
  })

  // Mensaje final
  const finalY = doc.lastAutoTable.finalY || 100
  doc.setFontSize(10)
  doc.setTextColor(150, 150, 150)
  doc.text('Generado automáticamente por GestivaOne.', 14, finalY + 20)

  // Extraer Base64 puro
  const dataUri = doc.output('datauristring')
  const base64 = dataUri.split(',')[1]
  return base64
}
