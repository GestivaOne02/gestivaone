// supabase/functions/crear-factura-bot/index.ts
// Edge Function: Registro de ventas, clientes, trabajadores y generación de reportes PDF para GestiBot
// Se ejecuta bajo demanda y de forma Serverless en Supabase.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Función para verificar GestiToken (OTP) mediante algoritmo TOTP/LCG determinista
function verifyOTP(companyId: string, inputCode: string): boolean {
  const cleanInput = inputCode.replace(/\s/g, "")
  const epochMin = Math.floor(Date.now() / 60000)
  
  const calcOTP = (min: number) => {
    let compHash = 0
    if (companyId) {
      for (let i = 0; i < companyId.length; i++) {
        compHash += companyId.charCodeAt(i)
      }
    }
    let seed = min * 1234567 + compHash * 98765 + 987654321
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const otp = 100000 + (seed % 900000)
    return otp.toString()
  }

  // Tolerancia de 1 minuto hacia atrás (para evitar fallas por desfase de reloj)
  return calcOTP(epochMin) === cleanInput || calcOTP(epochMin - 1) === cleanInput
}

// Helper para formatear valores monetarios
const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

// Función para generar un archivo PDF de Factura profesional
async function generateInvoicePDF(data: {
  invoice_number: string
  created_at: string
  client_name: string
  company_name: string
  product_name: string
  quantity: number
  subtotal: number
  tax_amount: number
  total: number
}) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.27, 841.89]) // Tamaño A4
  const { width, height } = page.getSize()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // 1. Banner Superior (Color de marca oscuro de GestivaOne)
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: rgb(30 / 255, 30 / 255, 46 / 255),
  })

  // Marca / Logo
  page.drawText(data.company_name, {
    x: 35,
    y: height - 40,
    size: 20,
    font: fontBold,
    color: rgb(167 / 255, 139 / 255, 250 / 255),
  })
  
  page.drawText("Facturación Electrónica Inteligente", {
    x: 35,
    y: height - 58,
    size: 9,
    font: fontRegular,
    color: rgb(200 / 255, 200 / 255, 200 / 255),
  })

  // Título e Información de Factura
  page.drawText("FACTURA DE VENTA", {
    x: width - 200,
    y: height - 35,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  page.drawText(`Nº: ${data.invoice_number}`, {
    x: width - 200,
    y: height - 52,
    size: 11,
    font: fontBold,
    color: rgb(124 / 255, 58 / 255, 237 / 255),
  })

  const formattedDate = new Date(data.created_at).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  page.drawText(`Fecha: ${formattedDate}`, {
    x: width - 200,
    y: height - 67,
    size: 9,
    font: fontRegular,
    color: rgb(200 / 255, 200 / 255, 200 / 255),
  })

  // 2. Sección de Detalles del Cliente
  page.drawRectangle({
    x: 35,
    y: height - 180,
    width: width - 70,
    height: 75,
    color: rgb(245 / 255, 245 / 250 / 255),
    borderColor: rgb(220 / 255, 220 / 230 / 255),
    borderWidth: 1,
  })

  page.drawText("INFORMACIÓN DEL CLIENTE", {
    x: 45,
    y: height - 125,
    size: 10,
    font: fontBold,
    color: rgb(124 / 255, 58 / 255, 237 / 255),
  })

  page.drawText(`Nombre / Razón Social: ${data.client_name}`, {
    x: 45,
    y: height - 145,
    size: 10,
    font: fontRegular,
    color: rgb(30 / 255, 30 / 255, 46 / 255),
  })

  page.drawText(`Estado de Pago: PAGADO (Inmediato)`, {
    x: 45,
    y: height - 165,
    size: 10,
    font: fontRegular,
    color: rgb(16 / 255, 185 / 255, 129 / 255),
  })

  // 3. Encabezados de Tabla de Ítems
  const tableTop = height - 230
  page.drawRectangle({
    x: 35,
    y: tableTop,
    width: width - 70,
    height: 25,
    color: rgb(124 / 255, 58 / 255, 237 / 255),
  })

  page.drawText("Descripción del Producto / Servicio", {
    x: 45,
    y: tableTop + 8,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  page.drawText("Cant.", {
    x: 320,
    y: tableTop + 8,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  page.drawText("Precio Unitario", {
    x: 390,
    y: tableTop + 8,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  page.drawText("Total COP", {
    x: 500,
    y: tableTop + 8,
    size: 9,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  // Fila del Producto
  const rowTop = tableTop - 30
  page.drawRectangle({
    x: 35,
    y: rowTop,
    width: width - 70,
    height: 30,
    color: rgb(1, 1, 1),
    borderColor: rgb(240 / 255, 240 / 245 / 255),
    borderWidth: 1,
  })

  page.drawText(data.product_name, {
    x: 45,
    y: rowTop + 10,
    size: 9,
    font: fontRegular,
    color: rgb(30 / 255, 30 / 255, 46 / 255),
  })

  page.drawText(data.quantity.toString(), {
    x: 320,
    y: rowTop + 10,
    size: 9,
    font: fontRegular,
    color: rgb(30 / 255, 30 / 255, 46 / 255),
  })

  page.drawText(formatter.format(data.subtotal / data.quantity), {
    x: 390,
    y: rowTop + 10,
    size: 9,
    font: fontRegular,
    color: rgb(30 / 255, 30 / 255, 46 / 255),
  })

  page.drawText(formatter.format(data.subtotal), {
    x: 500,
    y: rowTop + 10,
    size: 9,
    font: fontRegular,
    color: rgb(30 / 255, 30 / 255, 46 / 255),
  })

  // 4. Sección de Totales
  const totalsTop = rowTop - 100
  page.drawText("Subtotal:", {
    x: 390,
    y: totalsTop + 70,
    size: 10,
    font: fontRegular,
    color: rgb(100 / 255, 100 / 110 / 255),
  })
  page.drawText(formatter.format(data.subtotal), {
    x: 500,
    y: totalsTop + 70,
    size: 10,
    font: fontRegular,
    color: rgb(30 / 255, 30 / 255, 46 / 255),
  })

  page.drawText("IVA (19%):", {
    x: 390,
    y: totalsTop + 50,
    size: 10,
    font: fontRegular,
    color: rgb(100 / 255, 100 / 110 / 255),
  })
  page.drawText(formatter.format(data.tax_amount), {
    x: 500,
    y: totalsTop + 50,
    size: 10,
    font: fontRegular,
    color: rgb(30 / 255, 30 / 255, 46 / 255),
  })

  // Línea divisoria de totales
  page.drawLine({
    start: { x: 380, y: totalsTop + 40 },
    end: { x: 560, y: totalsTop + 40 },
    color: rgb(220 / 255, 220 / 230 / 255),
    thickness: 1,
  })

  page.drawText("Total General:", {
    x: 390,
    y: totalsTop + 20,
    size: 11,
    font: fontBold,
    color: rgb(124 / 255, 58 / 255, 237 / 255),
  })
  page.drawText(formatter.format(data.total), {
    x: 500,
    y: totalsTop + 20,
    size: 11,
    font: fontBold,
    color: rgb(124 / 255, 58 / 255, 237 / 255),
  })

  // Footer Decorativo
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 40,
    color: rgb(245 / 255, 245 / 250 / 255),
  })

  page.drawText("Factura oficial generada por GestiBot para GestivaOne SaaS. Todos los derechos reservados.", {
    x: 35,
    y: 15,
    size: 8,
    font: fontRegular,
    color: rgb(120 / 255, 120 / 130 / 255),
  })

  return await pdfDoc.save()
}

// Función para generar un Reporte PDF profesional con tablas y balance
async function generateReportPDF(data: {
  days: number
  company_name: string
  total_ingresos: number
  total_egresos: number
  balance: number
  invoices: Array<{ client_name: string; total: number; created_at: string }>
  expenses: Array<{ description: string; category: string; amount: number; created_at: string }>
}) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.27, 841.89]) // Tamaño A4
  const { width, height } = page.getSize()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // 1. Banner Superior (Estilo GestivaOne)
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: rgb(30 / 255, 30 / 255, 46 / 255),
  })

  page.drawText(`Reporte de Caja: ${data.company_name}`, {
    x: 35,
    y: height - 40,
    size: 18,
    font: fontBold,
    color: rgb(167 / 255, 139 / 255, 250 / 255),
  })

  page.drawText(`Resumen financiero consolidado — Últimos ${data.days} días`, {
    x: 35,
    y: height - 58,
    size: 10,
    font: fontRegular,
    color: rgb(200 / 255, 200 / 255, 200 / 255),
  })

  // 2. Tarjetas de Resumen
  const cardWidth = 160
  const cardHeight = 55
  const cardY = height - 155

  // Tarjeta Ingresos (Verde)
  page.drawRectangle({
    x: 35,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    color: rgb(240 / 255, 253 / 255, 244 / 255),
    borderColor: rgb(187 / 255, 247 / 255, 208 / 255),
    borderWidth: 1,
  })
  page.drawText("TOTAL INGRESOS", { x: 45, y: cardY + 38, size: 8, font: fontBold, color: rgb(22 / 255, 101 / 255, 52 / 255) })
  page.drawText(formatter.format(data.total_ingresos), { x: 45, y: cardY + 15, size: 13, font: fontBold, color: rgb(21 / 255, 128 / 255, 61 / 255) })

  // Tarjeta Egresos (Rojo)
  page.drawRectangle({
    x: 35 + cardWidth + 20,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    color: rgb(254 / 255, 242 / 255, 242 / 255),
    borderColor: rgb(254 / 255, 202 / 255, 202 / 255),
    borderWidth: 1,
  })
  page.drawText("TOTAL EGRESOS", { x: 35 + cardWidth + 30, y: cardY + 38, size: 8, font: fontBold, color: rgb(153 / 255, 27 / 255, 27 / 255) })
  page.drawText(formatter.format(data.total_egresos), { x: 35 + cardWidth + 30, y: cardY + 15, size: 13, font: fontBold, color: rgb(185 / 255, 28 / 255, 28 / 255) })

  // Tarjeta Balance
  const balanceColor = data.balance >= 0 ? rgb(21 / 255, 128 / 255, 61 / 255) : rgb(185 / 255, 28 / 255, 28 / 255)
  page.drawRectangle({
    x: 35 + (cardWidth * 2) + 40,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    color: rgb(245 / 255, 245 / 250 / 255),
    borderColor: rgb(220 / 255, 220 / 230 / 255),
    borderWidth: 1,
  })
  page.drawText("BALANCE NETO", { x: 35 + (cardWidth * 2) + 50, y: cardY + 38, size: 8, font: fontBold, color: rgb(100 / 255, 100 / 110 / 255) })
  page.drawText(formatter.format(data.balance), { x: 35 + (cardWidth * 2) + 50, y: cardY + 15, size: 13, font: fontBold, color: balanceColor })

  // ==========================================
  // GRÁFICO COMPARATIVO DE FLUJO DE CAJA
  // ==========================================
  const chartContainerY = height - 225
  const chartContainerHeight = 50
  page.drawRectangle({
    x: 35,
    y: chartContainerY,
    width: width - 70,
    height: chartContainerHeight,
    color: rgb(248 / 255, 250 / 255, 252 / 255),
    borderColor: rgb(226 / 255, 232 / 255, 240 / 255),
    borderWidth: 1,
  })

  // Leyenda del gráfico
  page.drawText("PROPORCIÓN DEL FLUJO DE CAJA (INGRESOS VS EGRESOS)", {
    x: 45,
    y: chartContainerY + 38,
    size: 7,
    font: fontBold,
    color: rgb(100 / 255, 116 / 255, 139 / 255)
  })

  const barX = 45
  const barY = chartContainerY + 14
  const barWidth = width - 90
  const barHeight = 16

  // Dibujar fondo de barra (gris)
  page.drawRectangle({
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight,
    color: rgb(226 / 255, 232 / 255, 240 / 255),
  })

  const totalFlow = data.total_ingresos + data.total_egresos
  let incomePct = 0
  let expensePct = 0

  if (totalFlow > 0) {
    incomePct = data.total_ingresos / totalFlow
    expensePct = data.total_egresos / totalFlow

    const incomeWidth = barWidth * incomePct
    const expenseWidth = barWidth * expensePct

    // Dibujar parte verde (Ingresos)
    if (incomeWidth > 0) {
      page.drawRectangle({
        x: barX,
        y: barY,
        width: incomeWidth,
        height: barHeight,
        color: rgb(34 / 255, 197 / 255, 94 / 255), // Verde
      })
    }

    // Dibujar parte roja (Egresos)
    if (expenseWidth > 0) {
      page.drawRectangle({
        x: barX + incomeWidth,
        y: barY,
        width: expenseWidth,
        height: barHeight,
        color: rgb(239 / 255, 68 / 255, 68 / 255), // Rojo
      })
    }
  }

  // Textos de porcentaje
  const pctText = totalFlow > 0 
    ? `Ingresos: ${Math.round(incomePct * 100)}% | Egresos: ${Math.round(expensePct * 100)}%` 
    : "Sin transacciones registradas en este período"
  
  const pctTextWidth = fontBold.widthOfText(pctText, 7)
  page.drawText(pctText, {
    x: width - 45 - pctTextWidth,
    y: chartContainerY + 38,
    size: 7,
    font: fontBold,
    color: totalFlow > 0 ? rgb(71 / 255, 85 / 255, 105 / 255) : rgb(148 / 255, 163 / 255, 184 / 255)
  })

  // 3. Tabla de Ingresos (Facturas)
  let yCursor = height - 265
  page.drawText("DETALLE DE INGRESOS (VENTAS)", { x: 35, y: yCursor, size: 9, font: fontBold, color: rgb(30 / 255, 30 / 255, 46 / 255) })
  
  yCursor -= 20
  page.drawRectangle({ x: 35, y: yCursor, width: width - 70, height: 18, color: rgb(124 / 255, 58 / 255, 237 / 255) })
  page.drawText("Fecha", { x: 45, y: yCursor + 5, size: 8, font: fontBold, color: rgb(255 / 255, 255 / 255, 255 / 255) })
  page.drawText("Cliente / Razón Social", { x: 120, y: yCursor + 5, size: 8, font: fontBold, color: rgb(255 / 255, 255 / 255, 255 / 255) })
  page.drawText("Estado", { x: 380, y: yCursor + 5, size: 8, font: fontBold, color: rgb(255 / 255, 255 / 255, 255 / 255) })
  page.drawText("Total COP", { x: 495, y: yCursor + 5, size: 8, font: fontBold, color: rgb(255 / 255, 255 / 255, 255 / 255) })

  const maxRows = 5
  if (data.invoices.length === 0) {
    yCursor -= 18
    page.drawRectangle({ x: 35, y: yCursor, width: width - 70, height: 18, color: rgb(255 / 255, 255 / 255, 255 / 255), borderColor: rgb(240 / 255, 240 / 245 / 255), borderWidth: 1 })
    page.drawText("No se registraron ventas en este período.", { x: 45, y: yCursor + 5, size: 8, font: fontRegular, color: rgb(148 / 255, 163 / 255, 184 / 255) })
  } else {
    const recentInvoices = data.invoices.slice(0, maxRows)
    recentInvoices.forEach((inv, index) => {
      yCursor -= 18
      const rowColor = index % 2 === 0 ? rgb(255 / 255, 255 / 255, 255 / 255) : rgb(248 / 255, 250 / 255, 252 / 255)
      page.drawRectangle({ 
        x: 35, 
        y: yCursor, 
        width: width - 70, 
        height: 18, 
        color: rowColor, 
        borderColor: rgb(241 / 255, 245 / 255, 249 / 255), 
        borderWidth: 1 
      })

      const dateText = new Date(inv.created_at).toLocaleDateString("es-CO")
      page.drawText(dateText, { x: 45, y: yCursor + 5, size: 8, font: fontRegular, color: rgb(51 / 255, 65 / 255, 85 / 255) })
      page.drawText(inv.client_name || "Cliente Express", { x: 120, y: yCursor + 5, size: 8, font: fontRegular, color: rgb(51 / 255, 65 / 255, 85 / 255) })
      
      // Indicador de pago
      page.drawCircle({ x: 384, y: yCursor + 8, radius: 3, color: rgb(34 / 255, 197 / 255, 94 / 255) })
      page.drawText("PAGADO", { x: 392, y: yCursor + 5, size: 7, font: fontBold, color: rgb(21 / 255, 128 / 255, 61 / 255) })

      // Alinear precio a la derecha
      const priceText = formatter.format(inv.total)
      const priceTextWidth = fontBold.widthOfText(priceText, 8)
      page.drawText(priceText, { 
        x: 550 - priceTextWidth, 
        y: yCursor + 5, 
        size: 8, 
        font: fontBold, 
        color: rgb(30 / 255, 41 / 255, 59 / 255) 
      })
    })
    
    if (data.invoices.length > maxRows) {
      yCursor -= 14
      page.drawText(`* Se muestran las últimas ${maxRows} ventas. Ingrese a la app para ver el listado completo.`, {
        x: 35,
        y: yCursor,
        size: 7,
        font: fontRegular,
        color: rgb(148 / 255, 163 / 255, 184 / 255)
      })
    }
  }

  // 4. Tabla de Egresos (Gastos)
  yCursor -= 30
  page.drawText("DETALLE DE EGRESOS (GASTOS)", { x: 35, y: yCursor, size: 9, font: fontBold, color: rgb(30 / 255, 30 / 255, 46 / 255) })
  
  yCursor -= 20
  page.drawRectangle({ x: 35, y: yCursor, width: width - 70, height: 18, color: rgb(239 / 255, 68 / 255, 68 / 255) })
  page.drawText("Fecha", { x: 45, y: yCursor + 5, size: 8, font: fontBold, color: rgb(255 / 255, 255 / 255, 255 / 255) })
  page.drawText("Descripción", { x: 120, y: yCursor + 5, size: 8, font: fontBold, color: rgb(255 / 255, 255 / 255, 255 / 255) })
  page.drawText("Categoría", { x: 380, y: yCursor + 5, size: 8, font: fontBold, color: rgb(255 / 255, 255 / 255, 255 / 255) })
  page.drawText("Monto COP", { x: 495, y: yCursor + 5, size: 8, font: fontBold, color: rgb(255 / 255, 255 / 255, 255 / 255) })

  if (data.expenses.length === 0) {
    yCursor -= 18
    page.drawRectangle({ x: 35, y: yCursor, width: width - 70, height: 18, color: rgb(255 / 255, 255 / 255, 255 / 255), borderColor: rgb(240 / 255, 240 / 245 / 255), borderWidth: 1 })
    page.drawText("No se registraron gastos en este período.", { x: 45, y: yCursor + 5, size: 8, font: fontRegular, color: rgb(148 / 255, 163 / 255, 184 / 255) })
  } else {
    const recentExpenses = data.expenses.slice(0, maxRows)
    recentExpenses.forEach((exp, index) => {
      yCursor -= 18
      const rowColor = index % 2 === 0 ? rgb(255 / 255, 255 / 255, 255 / 255) : rgb(248 / 255, 250 / 255, 252 / 255)
      page.drawRectangle({ 
        x: 35, 
        y: yCursor, 
        width: width - 70, 
        height: 18, 
        color: rowColor, 
        borderColor: rgb(241 / 255, 245 / 255, 249 / 255), 
        borderWidth: 1 
      })

      const dateText = new Date(exp.created_at).toLocaleDateString("es-CO")
      page.drawText(dateText, { x: 45, y: yCursor + 5, size: 8, font: fontRegular, color: rgb(51 / 255, 65 / 255, 85 / 255) })
      page.drawText(exp.description || "Gasto sin descripción", { x: 120, y: yCursor + 5, size: 8, font: fontRegular, color: rgb(51 / 255, 65 / 255, 85 / 255) })
      
      // Categoría
      page.drawText(exp.category || "Otros", { x: 380, y: yCursor + 5, size: 8, font: fontRegular, color: rgb(71 / 255, 85 / 255, 105 / 255) })

      // Alinear precio a la derecha (Rojo)
      const amountText = formatter.format(exp.amount)
      const amountTextWidth = fontBold.widthOfText(amountText, 8)
      page.drawText(amountText, { 
        x: 550 - amountTextWidth, 
        y: yCursor + 5, 
        size: 8, 
        font: fontBold, 
        color: rgb(185 / 255, 28 / 255, 28 / 255) 
      })
    })

    if (data.expenses.length > maxRows) {
      yCursor -= 14
      page.drawText(`* Se muestran los últimos ${maxRows} egresos. Ingrese a la app para ver el listado completo.`, {
        x: 35,
        y: yCursor,
        size: 7,
        font: fontRegular,
        color: rgb(148 / 255, 163 / 255, 184 / 255)
      })
    }
  }

  // Footer Decorativo
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 40,
    color: rgb(245 / 255, 245 / 250 / 255),
  })

  page.drawText("Reporte oficial consolidado emitido por GestiBot para GestivaOne. Confidencial.", {
    x: 35,
    y: 15,
    size: 8,
    font: fontRegular,
    color: rgb(120 / 255, 120 / 130 / 255),
  })

  return await pdfDoc.save()
}

Deno.serve(async (req: Request) => {
  // Manejo de CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  // 1. Inicializar credenciales de Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

  // Determinar si estamos en modo Demo/Simulación
  const isDemoMode = !supabaseUrl || 
                     supabaseUrl.includes("your-project-name") || 
                     !supabaseServiceKey;

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let body: {
    action?: string
    user_phone: string
    days?: number
    
    // Parámetros de Factura
    client_name?: string
    product_name?: string
    amount?: number
    quantity?: number
    
    // Parámetros de Cliente
    client_email?: string
    client_phone?: string
    client_address?: string
    client_document?: string
    
    // Parámetros de Trabajador
    worker_name?: string
    worker_email?: string
    worker_role?: string
    worker_phone?: string
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo JSON inválido" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  const { 
    action = "crear_factura", 
    user_phone,
    days = 3,
    
    // Parámetros de OTP
    otp_code,
    
    // Parámetros de Factura
    client_name,
    product_name,
    amount,
    quantity = 1,
    
    // Parámetros de Cliente
    client_email,
    client_phone,
    client_address,
    client_document,
    
    // Parámetros de Trabajador
    worker_name,
    worker_email,
    worker_role = "despachador",
    worker_phone
  } = body

  // Validar teléfono de origen
  if (!user_phone) {
    return new Response(
      JSON.stringify({ error: "Falta el campo requerido: user_phone" }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    )
  }

  try {
    let company_id = "demo-company-id"
    let companyName = "Mi Empresa (Modo Demo)"
    let companyData: any = null

    if (!isDemoMode) {
      // Extraer y limpiar el número de teléfono del usuario de WhatsApp
      const cleanPhone = user_phone.split("@")[0].replace(/\D/g, "")

      // Buscar el perfil del usuario de WhatsApp para obtener su company_id (Multi-inquilino)
      const { data: profiles, error: profError } = await supabase
        .from("profiles")
        .select("company_id, full_name")
        .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone.slice(-10)}`)
        .limit(1)

      if (profError || !profiles || profiles.length === 0) {
        console.error("Perfil no encontrado para el teléfono:", cleanPhone, profError)
        return new Response(
          JSON.stringify({ error: `No se encontró ninguna cuenta de GestivaOne vinculada al número ${cleanPhone}.` }),
          { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      company_id = profiles[0].company_id

      // Obtener información de la empresa
      const { data: dbCompany } = await supabase
        .from("companies")
        .select("name, settings")
        .eq("id", company_id)
        .single()

      if (dbCompany) {
        companyData = dbCompany
        companyName = dbCompany.name
      }
    }

    // =========================================================================
    // ACCIÓN: VALIDAR GESTITOKEN (OTP)
    // =========================================================================
    if (action === "validar_otp") {
      if (!otp_code) {
        return new Response(
          JSON.stringify({ error: "Falta el campo requerido: otp_code" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      if (isDemoMode) {
        const isValid = /^\d{6}$/.test(otp_code.replace(/\s/g, ""))
        if (isValid) {
          return new Response(
            JSON.stringify({
              success: true,
              message: "GestiToken verificado con éxito, patrón (Modo Demo). Su sesión en WhatsApp ha sido autorizada por 1 hora."
            }),
            { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          )
        } else {
          return new Response(
            JSON.stringify({ error: "El GestiToken ingresado no es válido. Debe tener 6 dígitos." }),
            { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          )
        }
      }

      // Validar código TOTP usando el company_id
      const isValid = verifyOTP(company_id, otp_code)
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "El GestiToken es incorrecto o ya expiró. Por favor consulte el código actual en el panel de GestivaOne." }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      // Registrar sesión activa en settings de la empresa
      const settings = companyData?.settings || {}
      const sessions = settings.gestibot_sessions || {}
      const duration = settings.gestibot_otp_duration || 3600000 // default 1h
      const cleanPhone = user_phone.split("@")[0].replace(/\D/g, "")

      sessions[cleanPhone] = new Date(Date.now() + duration).toISOString()

      const updatedSettings = {
        ...settings,
        gestibot_sessions: sessions
      }

      const { error: updateError } = await supabase
        .from("companies")
        .update({ settings: updatedSettings })
        .eq("id", company_id)

      if (updateError) {
        console.error("Error al actualizar sesiones de GestiBot:", updateError)
        return new Response(
          JSON.stringify({ error: "No se pudo actualizar la sesión autorizada en la base de datos." }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      const durationMin = Math.round(duration / 60000)
      return new Response(
        JSON.stringify({
          success: true,
          message: `Código verificado con éxito, patrón. Su sesión ha sido iniciada. El bot estará desbloqueado durante los próximos ${durationMin} minutos para sus consultas.`
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // =========================================================================
    // ACCIÓN: OBTENER REPORTE FINANCIERO CON PDF
    // =========================================================================
    if (action === "obtener_reporte") {
      const cleanPhone = user_phone.split("@")[0].replace(/\D/g, "")
      
      // Enforce Dynamic Key Check if enabled
      if (!isDemoMode && companyData) {
        const settings = companyData.settings || {}
        if (settings.gestibot_otp_enabled) {
          const sessions = settings.gestibot_sessions || {}
          const expiry = sessions[cleanPhone]
          const isSessionActive = expiry && new Date(expiry) > new Date()

          if (!isSessionActive) {
            return new Response(
              JSON.stringify({
                success: false,
                security_blocked: true,
                message: "Por motivos de seguridad, su sesión de consulta en WhatsApp ha expirado o está inactiva. Por favor, genere un código de 6 dígitos en el panel de GestivaOne (sección GestiToken) y escríbalo aquí para autorizar el acceso."
              }),
              { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            )
          }
        }
      }

      const daysCount = Number(days)
      let invoicesList = []
      let expensesList = []
      let totalIngresos = 0
      let totalEgresos = 0
      let balance = 0

      if (isDemoMode) {
        // Generar listas simuladas en Modo Demo
        invoicesList = [
          { client_name: "Juan Pérez (Demo)", total: 450000, created_at: new Date(Date.now() - 3600000).toISOString() },
          { client_name: "María Gómez (Demo)", total: 350000, created_at: new Date(Date.now() - 7200000).toISOString() },
          { client_name: "Carlos Mendoza (Demo)", total: 550000, created_at: new Date(Date.now() - 86400000).toISOString() },
        ]
        expensesList = [
          { description: "Compra de Papelería", category: "Oficina", amount: 120000, created_at: new Date(Date.now() - 18000000).toISOString() },
          { description: "Pago Internet Claro", category: "Servicios", amount: 150000, created_at: new Date(Date.now() - 43200000).toISOString() },
          { description: "Transportes y Mensajería", category: "Logística", amount: 210000, created_at: new Date(Date.now() - 90000000).toISOString() },
        ]
        totalIngresos = invoicesList.reduce((sum, inv) => sum + inv.total, 0)
        totalEgresos = expensesList.reduce((sum, exp) => sum + exp.amount, 0)
        balance = totalIngresos - totalEgresos
      } else {
        // Consulta real en base de datos Supabase
        const dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() - daysCount)
        const dateStr = dateLimit.toISOString()

        // Consultar Facturas
        const { data: invoices, error: invError } = await supabase
          .from("invoices")
          .select("client_name, total, created_at")
          .eq("company_id", company_id)
          .gte("created_at", dateStr)
          .order("created_at", { ascending: false })

        if (invError) throw new Error(`Error consultando ingresos: ${invError.message}`)
        invoicesList = invoices || []

        // Consultar Gastos
        const { data: expenses, error: expError } = await supabase
          .from("expenses")
          .select("amount, description, category, created_at")
          .eq("company_id", company_id)
          .gte("created_at", dateStr)
          .order("created_at", { ascending: false })

        if (expError) throw new Error(`Error consultando egresos: ${expError.message}`)
        expensesList = expenses || []

        totalIngresos = invoicesList.reduce((sum, inv) => sum + (inv.total || 0), 0)
        totalEgresos = expensesList.reduce((sum, exp) => sum + (exp.amount || 0), 0)
        balance = totalIngresos - totalEgresos
      }

      // Generar el PDF consolidado del reporte
      let pdfUrl = ""
      try {
        const reportPdfBytes = await generateReportPDF({
          days: daysCount,
          company_name: companyName,
          total_ingresos: totalIngresos,
          total_egresos: totalEgresos,
          balance: balance,
          invoices: invoicesList,
          expenses: expensesList,
        })

        // Subir a Storage en bucket público
        const randomSalt = Math.floor(1000 + Math.random() * 9000)
        const filename = `reporte-${daysCount}d-${company_id}-${randomSalt}.pdf`

        const { error: uploadError } = await supabase.storage
          .from("facturas-pdf")
          .upload(filename, reportPdfBytes, {
            contentType: "application/pdf",
            upsert: true,
          })

        if (uploadError) {
          console.error("Error al subir el reporte PDF a Storage:", uploadError)
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("facturas-pdf")
            .getPublicUrl(filename)
          pdfUrl = publicUrlData?.publicUrl || ""
        }
      } catch (pdfErr) {
        console.error("Excepción al generar o subir el reporte PDF:", pdfErr)
      }

      return new Response(
        JSON.stringify({
          success: true,
          demo: isDemoMode,
          total_ingresos: totalIngresos,
          total_egresos: totalEgresos,
          balance: balance,
          pdf_url: pdfUrl,
          message: `Reporte de los últimos ${daysCount} días: Ingresos de ${formatter.format(totalIngresos)} COP y egresos de ${formatter.format(totalEgresos)} COP. Balance neto de ${formatter.format(balance)} COP. PDF generado.`
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // =========================================================================
    // ACCIÓN: CREAR CLIENTE
    // =========================================================================
    if (action === "crear_cliente") {
      if (!client_name) {
        return new Response(
          JSON.stringify({ error: "Falta el campo requerido: client_name" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      if (isDemoMode) {
        return new Response(
          JSON.stringify({
            success: true,
            demo: true,
            client_id: "demo-client-uuid",
            client_name,
            message: `Cliente ${client_name} registrado con éxito en GestivaOne (Modo Demo).`
          }),
          { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      const { data: newClient, error: clientCreateError } = await supabase
        .from("clients")
        .insert([{
          company_id,
          name: client_name,
          email: client_email || null,
          phone: client_phone || null,
          address: client_address || null,
          document_id: client_document || null,
          status: "active",
          type: "frequent"
        }])
        .select("id")
        .single()

      if (clientCreateError || !newClient) {
        console.error("Error al crear cliente:", clientCreateError)
        return new Response(
          JSON.stringify({ error: "No se pudo registrar el cliente en la base de datos." }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          demo: false,
          client_id: newClient.id,
          client_name,
          message: `Cliente ${client_name} registrado con éxito en GestivaOne.`
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // =========================================================================
    // ACCIÓN: CREAR TRABAJADOR
    // =========================================================================
    if (action === "crear_trabajador") {
      if (!worker_name || !worker_email) {
        return new Response(
          JSON.stringify({ error: "Faltan campos requeridos: worker_name, worker_email" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      if (isDemoMode) {
        return new Response(
          JSON.stringify({
            success: true,
            demo: true,
            worker_id: "demo-worker-uuid",
            worker_name,
            message: `Trabajador ${worker_name} registrado con éxito con el rol de ${worker_role} (Modo Demo).`
          }),
          { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      const { data: newWorker, error: workerCreateError } = await supabase
        .from("profiles")
        .insert([{
          id: crypto.randomUUID(),
          company_id,
          full_name: worker_name,
          email: worker_email,
          role: worker_role,
          phone: worker_phone || ""
        }])
        .select("id")
        .single()

      if (workerCreateError || !newWorker) {
        console.error("Error al crear trabajador:", workerCreateError)
        return new Response(
          JSON.stringify({ error: "No se pudo registrar el trabajador en la base de datos." }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          demo: false,
          worker_id: newWorker.id,
          worker_name,
          message: `Trabajador ${worker_name} registrado con éxito con el rol de ${worker_role}.`
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // =========================================================================
    // ACCIÓN POR DEFECTO: CREAR FACTURA Y REGISTRAR VENTA
    // =========================================================================
    if (!client_name || !product_name || !amount) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos para factura: client_name, product_name, amount" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    if (isDemoMode) {
      const mockInvoiceId = "demo-invoice-uuid-" + Math.floor(1000 + Math.random() * 9000)
      const mockNumber = mockInvoiceId.slice(-8).toUpperCase()
      const totalAmount = Math.round(amount * quantity * 1.19)
      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          invoice_id: mockInvoiceId,
          invoice_number: mockNumber,
          created_at: new Date().toISOString(),
          client_name,
          company_name: companyName,
          product_name,
          quantity,
          subtotal: amount * quantity,
          tax_amount: Math.round(amount * quantity * 0.19),
          total: totalAmount,
          pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          message: `Venta registrada para ${client_name}. Factura #${mockNumber} generada con éxito por ${formatter.format(totalAmount)} COP (Modo Demo).`
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // Buscar o auto-crear el cliente en la tabla `clients` para la empresa correspondiente
    let client_id = null
    const { data: existingClients } = await supabase
      .from("clients")
      .select("id")
      .eq("company_id", company_id)
      .ilike("name", `%${client_name}%`)
      .limit(1)

    if (existingClients && existingClients.length > 0) {
      client_id = existingClients[0].id
    } else {
      // Creamos un registro express de cliente si no existía en el CRM de GestivaOne
      const { data: newClient, error: clientCreateError } = await supabase
        .from("clients")
        .insert([{
          company_id,
          name: client_name,
          status: "active",
          type: "express"
        }])
        .select("id")
        .single()

      if (!clientCreateError && newClient) {
        client_id = newClient.id
      }
    }

    // Calcular valores de facturación con IVA (19% estándar DIAN)
    const subtotal = amount * quantity
    const taxRate = 0.19 
    const taxAmount = Math.round(subtotal * taxRate)
    const total = subtotal + taxAmount

    const items = [
      {
        product_name: product_name,
        price: amount,
        quantity: quantity
      }
    ]

    // Crear la Factura en la tabla `invoices`
    const { data: newInvoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert([{
        company_id,
        client_name,
        client_id,
        items,
        subtotal,
        tax_amount: taxAmount,
        tax_rate: taxRate,
        total,
        status: "paid",
        payment_type: "immediate",
        payment_status: "paid"
      }])
      .select("id, created_at")
      .single()

    if (invoiceError || !newInvoice) {
      console.error("Error al insertar la factura:", invoiceError)
      return new Response(
        JSON.stringify({ error: "No se pudo registrar la factura en la base de datos de Supabase." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      )
    }

    // Crear el registro del Pago correspondiente en la tabla `invoice_payments`
    const { error: paymentError } = await supabase
      .from("invoice_payments")
      .insert([{
        company_id,
        invoice_id: newInvoice.id,
        amount: total,
        method: "cash"
      }])

    if (paymentError) {
      console.warn("No se pudo registrar el pago asociado en invoice_payments:", paymentError)
    }

    // Generar el PDF real en memoria
    const invoiceNumber = newInvoice.id.slice(-8).toUpperCase()
    let pdfUrl = ""
    try {
      const pdfBytes = await generateInvoicePDF({
        invoice_number: invoiceNumber,
        created_at: newInvoice.created_at,
        client_name,
        company_name: companyName,
        product_name,
        quantity,
        subtotal,
        tax_amount: taxAmount,
        total,
      })

      // Subir a Supabase Storage (bucket público: facturas-pdf)
      const { error: uploadError } = await supabase.storage
        .from("facturas-pdf")
        .upload(`${newInvoice.id}.pdf`, pdfBytes, {
          contentType: "application/pdf",
          upsert: true,
        })

      if (uploadError) {
        console.error("Error al subir el PDF a Storage:", uploadError)
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("facturas-pdf")
          .getPublicUrl(`${newInvoice.id}.pdf`)
        pdfUrl = publicUrlData?.publicUrl || ""
      }
    } catch (pdfErr) {
      console.error("Excepción al generar o subir el PDF:", pdfErr)
    }

    // Devolver los detalles de éxito de la factura generada
    return new Response(
      JSON.stringify({
        success: true,
        invoice_id: newInvoice.id,
        invoice_number: invoiceNumber,
        created_at: newInvoice.created_at,
        client_name,
        company_name: companyName,
        product_name,
        quantity,
        subtotal,
        tax_amount: taxAmount,
        total,
        pdf_url: pdfUrl,
        message: `Venta registrada para ${client_name}. Factura #${invoiceNumber} generada con éxito por ${formatter.format(total)}.`
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    )

  } catch (err) {
    console.error("Error interno del servidor en Edge Function:", err)
    return new Response(
      JSON.stringify({ error: "Error interno al procesar la solicitud." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    )
  }
})
