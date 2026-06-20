/**
 * exportService.js
 * PDF and Excel export utilities for GestivaOne
 * Uses jsPDF + autotable for PDF, xlsx for Excel
 */

// ── PDF ────────────────────────────────────────────────────────
export async function exportInvoicesPDF(invoices, companyName = 'Mi Empresa') {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Header
  doc.setFillColor(30, 30, 46)
  doc.rect(0, 0, 297, 28, 'F')
  doc.setTextColor(167, 139, 250)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setFont('Inter', 'bold')
doc.text('Gestiva', MARGIN, 12)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('One', MARGIN, 18)
doc.text(`Reporte de Facturas — ${companyName}`, MARGIN, 25)
// Align date to right margin
const pageWidth = doc.internal.pageSize.getWidth()
doc.text(new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), pageWidth - MARGIN, 25, { align: 'right' })
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(9)
  doc.text(`Reporte de Facturas — ${companyName}`, 14, 25)
  doc.text(new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), 260, 25, { align: 'right' })

  const STATUS_ES = { paid: 'Pagada', pending: 'Pendiente', overdue: 'Atrasada', cancelled: 'Cancelada' }
  const rows = invoices.map((inv) => [
    inv.id?.slice(-8)?.toUpperCase() || '—',
    inv.clientName || 'Sin cliente',
    new Date(inv.createdAt).toLocaleDateString('es-CO'),
    STATUS_ES[inv.status] || inv.status,
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inv.total || 0),
  ])

  autoTable(doc, {
    startY: 32,
    head: [['ID', 'Cliente', 'Fecha', 'Estado', 'Total']],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
  })

  const total = invoices.reduce((s, i) => s + (i.total || 0), 0)
  const finalY = doc.lastAutoTable.finalY + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(30, 30, 46)
  doc.text(`Total general: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total)}`, 280, finalY, { align: 'right' })

  doc.save(`facturas_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export async function exportClientsPDF(clients, companyName = 'Mi Empresa') {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  doc.setFillColor(30, 30, 46)
  doc.rect(0, 0, 210, 25, 'F')
  doc.setTextColor(167, 139, 250)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('GestivaOne', 14, 12)
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(8)
  doc.text(`Clientes — ${companyName}`, 14, 20)
  doc.text(new Date().toLocaleDateString('es-CO'), 196, 20, { align: 'right' })

  const TYPE_ES = { frequent: 'Frecuente', express: 'Express' }
  const rows = clients.map((c) => [
    c.name,
    c.email || '—',
    c.phone || '—',
    c.address || '—',
    TYPE_ES[c.type] || c.type,
    c.status === 'active' ? 'Activo' : 'Inactivo',
  ])

  autoTable(doc, {
    startY: 29,
    head: [['Nombre', 'Correo', 'Teléfono', 'Dirección', 'Tipo', 'Estado']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 250] },
  })

  doc.save(`clientes_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export async function exportProductsPDF(products, companyName = 'Mi Empresa') {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  doc.setFillColor(30, 30, 46)
  doc.rect(0, 0, 210, 25, 'F')
  doc.setTextColor(167, 139, 250)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('GestivaOne', 14, 12)
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(8)
  doc.text(`Inventario — ${companyName}`, 14, 20)
  doc.text(new Date().toLocaleDateString('es-CO'), 196, 20, { align: 'right' })

  const rows = products.map((p) => [
    p.name,
    p.category || '—',
    p.unit === 'ILIMITADO' ? 'Ilimitado' : (p.unit || '—'),
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.price || 0),
    p.unit === 'ILIMITADO' ? 'Ilimitado' : (p.stock ?? '—'),
    p.unit === 'ILIMITADO' ? 'OK' : (p.stock <= (p.minStock || 5) ? '⚠ Bajo' : 'OK'),
  ])

  autoTable(doc, {
    startY: 29,
    head: [['Producto', 'Categoría', 'Unidad', 'Precio', 'Stock', 'Estado']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'center' }, 5: { halign: 'center' } },
  })

  doc.save(`inventario_${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ── Excel ──────────────────────────────────────────────────────
export async function exportInvoicesExcel(invoices, companyName = 'Mi Empresa') {
  const XLSX = await import('xlsx')

  const STATUS_ES = { paid: 'Pagada', pending: 'Pendiente', overdue: 'Atrasada', cancelled: 'Cancelada' }
  const data = [
    [companyName, '', '', '', new Date().toLocaleDateString('es-CO')],
    [],
    ['ID', 'Cliente', 'Fecha', 'Estado', 'Total (COP)'],
    ...invoices.map((inv) => [
      inv.id?.slice(-8)?.toUpperCase() || '',
      inv.clientName || '',
      new Date(inv.createdAt).toLocaleDateString('es-CO'),
      STATUS_ES[inv.status] || inv.status,
      inv.total || 0,
    ]),
    [],
    ['', '', '', 'TOTAL', invoices.reduce((s, i) => s + (i.total || 0), 0)],
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 18 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Facturas')
  XLSX.writeFile(wb, `facturas_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export async function exportClientsExcel(clients, companyName = 'Mi Empresa') {
  const XLSX = await import('xlsx')
  const TYPE_ES = { frequent: 'Frecuente', express: 'Express' }
  const data = [
    [companyName, '', '', '', '', new Date().toLocaleDateString('es-CO')],
    [],
    ['Nombre', 'Correo', 'Teléfono', 'Dirección', 'Tipo', 'Estado'],
    ...clients.map((c) => [
      c.name, c.email || '', c.phone || '', c.address || '',
      TYPE_ES[c.type] || c.type, c.status === 'active' ? 'Activo' : 'Inactivo',
    ]),
  ]
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 30 }, { wch: 12 }, { wch: 10 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes')
  XLSX.writeFile(wb, `clientes_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export async function exportProductsExcel(products, companyName = 'Mi Empresa') {
  const XLSX = await import('xlsx')
  const data = [
    [companyName, '', '', '', '', new Date().toLocaleDateString('es-CO')],
    [],
    ['Producto', 'Categoría', 'Unidad', 'Precio (COP)', 'Stock', 'Estado'],
    ...products.map((p) => [
      p.name, p.category || '', p.unit === 'ILIMITADO' ? 'Ilimitado' : (p.unit || ''), p.price || 0,
      p.unit === 'ILIMITADO' ? 'Ilimitado' : (p.stock ?? 0),
      p.unit === 'ILIMITADO' ? 'OK' : (p.stock <= (p.minStock || 5) ? 'Stock Bajo' : 'OK'),
    ]),
  ]
  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 26 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 12 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')
  XLSX.writeFile(wb, `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export async function exportSingleInvoicePDF(invoice, client = null, settings = {}) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
const MARGIN = 15 // 15mm margin as per design
  const isMinimalist = settings.pdfTemplate === 'minimalist'

  const companyName = settings.companyName || 'GestivaOne'
  const companyPhone = settings.companyPhone || ''
  const companyEmail = settings.companyEmail || ''
  const invoiceIdStr = (invoice.id?.slice(-8) || invoice.id || 'N/A').toUpperCase()
  const dateStr = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('es-CO') : new Date().toLocaleDateString('es-CO')
  
  let itemsList = []
  if (invoice.items) {
    try {
      itemsList = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
    } catch (e) {
      console.error('Error parsing invoice items for PDF:', e)
    }
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val)
  }

  const themeColor = settings.themeColor || 'indigo'
  
  const hexToRgb = (hex) => {
    let r = 0, g = 0, b = 0;
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    return [r, g, b];
  };

  const getThemeColorsRGB = (theme) => {
    if (theme && theme.startsWith('#')) {
      const rgb = hexToRgb(theme);
      return {
        dark: rgb.map(c => Math.max(0, c - 40)),
        light: rgb.map(c => Math.min(255, c + 150)),
        primary: rgb
      }
    }
    switch (theme) {
      case 'emerald': return { dark: [6, 78, 59], light: [167, 243, 208], primary: [5, 150, 105] }
      case 'blue': return { dark: [30, 58, 138], light: [191, 219, 254], primary: [37, 99, 235] }
      case 'rose': return { dark: [76, 5, 25], light: [254, 205, 211], primary: [225, 29, 72] }
      case 'amber': return { dark: [120, 53, 15], light: [253, 230, 138], primary: [217, 119, 6] }
      case 'slate': return { dark: [15, 23, 42], light: [203, 213, 225], primary: [71, 85, 105] }
      case 'indigo':
      default: return { dark: [30, 27, 75], light: [199, 210, 254], primary: [79, 70, 229] }
    }
  }
  const rgbColors = getThemeColorsRGB(themeColor)

  // 1. HEADER BRANDING
  if (!isMinimalist) {
    // Corporate Header (Vibrant background band)
    doc.setFillColor(...rgbColors.dark)
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor(...rgbColors.light)
    doc.setFont('Inter', 'bold')
    doc.setFontSize(26)
    doc.text(companyName.toUpperCase(), MARGIN, 18)
    
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text('FACTURA DE VENTA COMERCIAL', MARGIN, 25)
    
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    if (companyPhone) doc.text(`Cel: ${companyPhone}`, MARGIN, 30)
    if (companyEmail) doc.text(`Email: ${companyEmail}`, MARGIN, 34)

    // Invoice badge
    doc.setFillColor(...rgbColors.primary)
    // Badge positioned with margin
    doc.rect(pageWidth - MARGIN - 50, 10, 50, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('Inter', 'bold')
    doc.text(`FACTURA N°`, pageWidth - MARGIN - 48, 16)
    doc.setFontSize(11)
    doc.text(`#${invoiceIdStr}`, pageWidth - MARGIN - 48, 24)
  } else {
    // Minimalist Header (Clean whitespace, no background bands)
    doc.setTextColor(15, 23, 42) // Slate-900
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.text(companyName, MARGIN, 20)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139) // Slate-500
    doc.text('Factura de Venta', MARGIN, 26)
    if (companyPhone || companyEmail) {
      doc.text(`${companyPhone}  |  ${companyEmail}`, MARGIN, 31)
    }

    // Minimalist Invoice Info on the right
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(`N° FACTURA: #${invoiceIdStr}`, pageWidth - MARGIN, 18, { align: 'right' })
    doc.setFont('Inter', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(`Fecha de Emisión: ${dateStr}`, pageWidth - MARGIN, 24, { align: 'right' })
  }

  // 2. CLIENT & METADATA SECTIONS
  let clientName = client?.name || invoice.client_name || 'Consumidor Final'
  let clientPhone = client?.phone || invoice.client_phone || '—'
  let clientEmail = client?.email || invoice.client_email || '—'
  let clientAddress = client?.address || invoice.client_address || '—'
  let clientDocId = client?.document_id || invoice.client_document_id || '—'

  let startY = 48
  if (!isMinimalist) {
    // Corporate Info Blocks (Increased height to 30 to prevent overflow)
    doc.setFillColor(248, 250, 252) // slate-50
    // Left client block with margin
    doc.rect(MARGIN, startY, 86, 30, 'F')
    // Right metadata block, shifted by margin from right edge
    const blockWidth = 86
    doc.rect(pageWidth - MARGIN - blockWidth, startY, blockWidth, 30, 'F')
    
    doc.setDrawColor(226, 232, 240)
    doc.rect(MARGIN, startY, 86, 30)
    doc.rect(pageWidth - MARGIN - blockWidth, startY, blockWidth, 30)

    // Left block: Client Info
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...rgbColors.primary)
    doc.text('FACTURAR A:', MARGIN + 4, startY + 5)
    
    doc.setFont('Inter', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(51, 65, 85)
    doc.text(`Nombre: ${clientName}`, MARGIN + 4, startY + 10)
    doc.text(`C.C. / NIT / Código: ${clientDocId}`, MARGIN + 4, startY + 14)
    doc.text(`Teléfono: ${clientPhone}`, MARGIN + 4, startY + 18)
    doc.text(`Email: ${clientEmail}`, MARGIN + 4, startY + 22)
    doc.text(`Dirección: ${clientAddress}`, MARGIN + 4, startY + 26)

    // Right block: Invoice Metadata
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...rgbColors.primary)
    doc.text('DETALLES DE FACTURA:', pageWidth - MARGIN - 86, startY + 5)
    
    doc.setFont('Inter', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(51, 65, 85)
    doc.text(`Fecha: ${dateStr}`, pageWidth - MARGIN - 86, startY + 10)
    doc.text(`Método Pago: ${invoice.payment_type === 'immediate' ? 'Inmediato' : 'Crédito'}`, pageWidth - MARGIN - 86, startY + 14)
    if (invoice.due_date || invoice.scheduledDate) {
      const d = invoice.due_date || invoice.scheduledDate
      doc.text(`Vencimiento: ${new Date(d).toLocaleDateString('es-CO')}`, pageWidth - MARGIN - 86, startY + 18)
    } else {
      doc.text(`Estado: ${invoice.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}`, pageWidth - MARGIN - 86, startY + 18)
    }
    doc.text(`Moneda: COP (Peso Colombiano)`, pageWidth - MARGIN - 86, startY + 22)
  } else {
    // Minimalist clean blocks
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text('CLIENTE', MARGIN, startY)
    doc.text('DETALLES', 120, startY)

    doc.setDrawColor(241, 245, 249)
    doc.line(MARGIN, startY + 2, pageWidth - MARGIN, startY + 2)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(51, 65, 85)
    
    // Client details
    doc.text(clientName, MARGIN, startY + 8)
    doc.text(`C.C. / NIT / Código: ${clientDocId}`, MARGIN, startY + 13)
    doc.text(`Tel: ${clientPhone}`, MARGIN, startY + 18)
    doc.text(`Email: ${clientEmail}`, MARGIN, startY + 23)
    if (clientAddress !== '—') doc.text(`Dirección: ${clientAddress}`, MARGIN, startY + 28)

    // Invoice details
    doc.text(`Fecha: ${dateStr}`, 120, startY + 8)
    doc.text(`Forma de Pago: ${invoice.payment_type === 'immediate' ? 'Inmediato' : 'Crédito'}`, 120, startY + 13)
    if (invoice.payment_status) {
      doc.text(`Estado: ${invoice.payment_status === 'paid' ? 'PAGADO' : 'PENDIENTE'}`, 120, startY + 18)
    }
  }

  // 3. PRODUCT ITEMS TABLE
  const tableStartY = isMinimalist ? startY + 36 : startY + 38
  const rows = itemsList.map((item, index) => [
    index + 1,
    item.name || item.product_name || 'Producto',
    item.quantity || 1,
    formatCurrency(item.price || 0),
    formatCurrency((item.price || 0) * (item.quantity || 1))
  ])

  const headStyles = isMinimalist 
    ? { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8.5 }
    : { fillColor: rgbColors.primary, textColor: 255, fontStyle: 'bold', fontSize: 9 }

  const alternateRowStyles = isMinimalist ? null : { fillColor: [248, 250, 252] }

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'Descripción del Producto', 'Cant', 'Precio Unitario', 'Total']],
    body: rows,
    styles: { fontSize: 8.5, cellPadding: 3.5, font: 'helvetica' },
    headStyles,
    alternateRowStyles,
    columnStyles: {
      0: { width: 10, halign: 'center' },
      2: { width: 15, halign: 'center' },
      3: { width: 35, halign: 'right' },
      4: { width: 35, halign: 'right' }
    }
  })

  // 4. TOTALS SUMMARY block
  const finalY = doc.lastAutoTable.finalY + 8
  const totalVal = invoice.total || 0
  const subtotalVal = invoice.subtotal || (invoice.total - (invoice.taxAmount || 0))
  const taxVal = invoice.taxAmount || 0
  const taxRatePercent = invoice.taxRate ? (invoice.taxRate * 100).toFixed(0) : '19'

  // Set position on the right side
  const summaryX = 130
  
  if (!isMinimalist) {
    doc.setFillColor(248, 250, 252)
    doc.rect(summaryX - 5, finalY - 4, 75, taxVal > 0 ? 28 : 20, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.rect(summaryX - 5, finalY - 4, 75, taxVal > 0 ? 28 : 20)

    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.setFont('Inter', 'normal')
    
    let currentY = finalY + 2
    if (taxVal > 0) {
      doc.text('Subtotal:', summaryX, currentY)
      doc.text(formatCurrency(subtotalVal), pageWidth - MARGIN, currentY, { align: 'right' })
      currentY += 6
      
      doc.text(`IVA (${taxRatePercent}%):`, summaryX, currentY)
      doc.text(formatCurrency(taxVal), pageWidth - MARGIN, currentY, { align: 'right' })
      currentY += 6
    }
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...rgbColors.primary)
    doc.text('TOTAL A PAGAR:', summaryX, currentY)
    doc.text(formatCurrency(totalVal), pageWidth - MARGIN, currentY, { align: 'right' })
  } else {
    // Minimalist summary
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.setFont('helvetica', 'normal')

    let currentY = finalY + 1
    if (taxVal > 0) {
      doc.text('Subtotal:', summaryX, currentY)
      doc.text(formatCurrency(subtotalVal), 195, currentY, { align: 'right' })
      
      doc.setDrawColor(241, 245, 249)
      doc.line(summaryX, currentY + 3, 200, currentY + 3)
      currentY += 6

      doc.text(`IVA (${taxRatePercent}%):`, summaryX, currentY)
      doc.text(formatCurrency(taxVal), 195, currentY, { align: 'right' })
      
      doc.line(summaryX, currentY + 3, 200, currentY + 3)
      currentY += 6
    }

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('TOTAL:', summaryX, currentY)
    doc.text(formatCurrency(totalVal), 195, currentY, { align: 'right' })
  }

  // 5. FOOTER
  const pageHeight = doc.internal.pageSize.height
  const footerText = settings.footerText || '¡Gracias por su compra!'
  
  doc.setDrawColor(226, 232, 240)
  const lineStartX = MARGIN
  const lineEndX = pageWidth - MARGIN
  doc.line(lineStartX, pageHeight - 35, lineEndX, pageHeight - 35)

  // QR Code insertion using an offscreen canvas to generate PNG data
  try {
    const qrText = `https://gestivaone.com/v/${invoice.id || 'N/A'}`
    const canvas = document.createElement('canvas')
    const QRCode = await import('qrcode')
    await QRCode.toCanvas(canvas, qrText, {
      width: 80,
      margin: 1,
      color: {
        dark: themeColor.startsWith('#') ? themeColor : '#0f172a',
        light: '#ffffff'
      }
    })
    const qrImgData = canvas.toDataURL('image/png')
    const qrX = pageWidth - MARGIN - 24
    const qrY = pageHeight - MARGIN - 24
    doc.addImage(qrImgData, 'PNG', qrX, qrY, 24, 24)
  } catch (qrErr) {
    console.warn('Could not render QR code in exportService PDF:', qrErr)
  }

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  doc.text(footerText, 105, pageHeight - 18, { align: 'center' })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text('Factura generada electrónicamente por GestivaOne. Todos los derechos reservados.', 105, pageHeight - 12, { align: 'center' })

  // Save the PDF
  doc.save(`factura_${invoiceIdStr}.pdf`)
}
