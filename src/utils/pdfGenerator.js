/**
 * pdfGenerator.js
 * Generates an offline printable PDF Quotation Job Slip and triggers native Android sharing.
 * Completely local, zero backend, works offline.
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { formatRupee, formatIndianNumber } from './currency';

/**
 * Builds standard HTML quotation layout for printing/PDF.
 */
export function buildQuotationHtml(quotation) {
  const {
    id = 'QT-DRAFT',
    createdAt = new Date().toISOString(),
    customerName = 'Walk-in Client',
    customerPhone = '-',
    jobReference = '-',
    product = 'Brochure',
    quantity = 1000,
    inputs = {},
    results = {},
    totalAmount = 0,
    unitPrice = 0
  } = quotation;

  const dateStr = new Date(createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const paper = results.paper || {};
  const printing = results.printing || {};
  const plates = results.plates || {};
  const finishing = results.finishing || {};
  const profit = results.profit || {};
  const tax = results.tax || {};

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quotation ${id}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      font-size: 13px;
    }
    .header {
      border-bottom: 2px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 24px;
      font-weight: bold;
      color: #004ac6;
      margin: 0;
    }
    .brand-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .quote-badge {
      text-align: right;
    }
    .quote-id {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
      margin: 0;
    }
    .quote-date {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
      background: #f8fafc;
      padding: 14px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .info-block h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
    }
    .info-block p {
      margin: 2px 0;
      font-size: 13px;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #eaedff;
      color: #004ac6;
      text-align: left;
      padding: 10px 12px;
      font-size: 12px;
      border-bottom: 1px solid #dae2fd;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .text-right {
      text-align: right;
    }
    .highlight-row {
      background: #f8fafc;
      font-weight: 600;
    }
    .total-card {
      background: #e7f6ed;
      border: 1px solid #22c55e;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
    }
    .total-title {
      font-size: 14px;
      font-weight: bold;
      color: #166534;
      margin: 0;
    }
    .total-unit {
      font-size: 12px;
      color: #166534;
      margin-top: 2px;
    }
    .total-amount {
      font-size: 26px;
      font-weight: bold;
      color: #166534;
      margin: 0;
      text-align: right;
    }
    .footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">Smart Printing Press</h1>
      <div class="brand-sub">Commercial Offset & Digital Press • Dehradun, Uttarakhand</div>
    </div>
    <div class="quote-badge">
      <div class="quote-id">${id}</div>
      <div class="quote-date">Date: ${dateStr}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-block">
      <h4>Client Details</h4>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
      ${jobReference ? `<p><strong>Ref / Note:</strong> ${jobReference}</p>` : ''}
    </div>
    <div class="info-block">
      <h4>Job Specifications</h4>
      <p><strong>Product:</strong> ${product}</p>
      <p><strong>Order Quantity:</strong> ${formatIndianNumber(quantity)} Units</p>
      <p><strong>Size:</strong> ${inputs.finishedWidth || '-'} × ${inputs.finishedHeight || '-'} in (${inputs.sheetWidth || '-'} × ${inputs.sheetHeight || '-'} Sheet)</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item Description</th>
        <th>Specifications</th>
        <th class="text-right">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Paper Stock</strong></td>
        <td>${inputs.gsm || 130} GSM • ${paper.totalSheets || 0} sheets (${paper.exactReams || 0} Reams)</td>
        <td class="text-right">${formatRupee(paper.paperCost || 0)}</td>
      </tr>
      <tr>
        <td><strong>Offset Printing Run</strong></td>
        <td>${inputs.sides || 2} Sides × ${inputs.colorsPerSide || 4} Colors • ${printing.totalRuns || 0} Runs</td>
        <td class="text-right">${formatRupee(printing.printingCost || 0)}</td>
      </tr>
      <tr>
        <td><strong>CTP Thermal Plates</strong></td>
        <td>${plates.plateCount || 0} Plates @ ${formatRupee(plates.plateRate || 250, false)}</td>
        <td class="text-right">${formatRupee(plates.plateCost || 0)}</td>
      </tr>
      <tr>
        <td><strong>Post-Press Finishing</strong></td>
        <td>Lamination, Folding, Die-cutting, Binding</td>
        <td class="text-right">${formatRupee(finishing.totalVariableFinishing || 0)}</td>
      </tr>
      <tr>
        <td><strong>Cutting & Packing Charges</strong></td>
        <td>Paper cutting, machine setup & wrapping</td>
        <td class="text-right">${formatRupee(finishing.totalFixedFinishing || 0)}</td>
      </tr>
      ${results.carbon?.isBillBook ? `
      <tr>
        <td><strong>Carbon Paper Required</strong></td>
        <td>${results.carbon.carbonSheets} Sheets</td>
        <td class="text-right">${formatRupee(results.carbon.carbonCost || 0)}</td>
      </tr>` : ''}
      <tr class="highlight-row">
        <td colspan="2">Net Production Cost</td>
        <td class="text-right">${formatRupee(results.productionCost || 0)}</td>
      </tr>
      <tr>
        <td colspan="2">Press Profit & Margin (${profit.effectiveMarginPct || profit.profitPercentage || 30}%)</td>
        <td class="text-right">${formatRupee(profit.profitAmount || 0)}</td>
      </tr>
      ${tax.gstRate > 0 ? `
      <tr>
        <td colspan="2">GST (${tax.gstRate}% ${tax.gstType})</td>
        <td class="text-right">${formatRupee(tax.gstAmount || 0)}</td>
      </tr>` : ''}
    </tbody>
  </table>

  <div class="total-card">
    <div>
      <div class="total-title">FINAL QUOTED PRICE</div>
      <div class="total-unit">Quoted Unit Rate: ${formatRupee(unitPrice)} / Pc</div>
    </div>
    <div class="total-amount">${formatRupee(totalAmount)}</div>
  </div>

  <div class="footer">
    <div>Smart Printing Press, Dehradun • Authorized Cost Quotation</div>
    <div>Generated Offline with Smart Press Cost Calculator</div>
  </div>
</body>
</html>
  `;
}

/**
 * Directly prints the quotation using Android / iOS native print service.
 * Includes Android's built-in "Save as PDF" option.
 */
export async function printQuotation(quotation) {
  try {
    const html = buildQuotationHtml(quotation);
    await Print.printAsync({ html });
  } catch (error) {
    console.error('Failed to print quotation:', error);
    throw error;
  }
}

/**
 * Generates PDF and opens native Android share sheet safely.
 * Copies the generated PDF into FileSystem.documentDirectory so that Android's
 * FileProvider is granted read permission, avoiding "Not allowed to read file".
 */
export async function shareQuotationPdf(quotation) {
  const html = buildQuotationHtml(quotation);

  try {
    // 1. Generate PDF file from HTML
    const printResult = await Print.printToFileAsync({ html });
    const rawUri = printResult.uri;
    const formattedUri = rawUri.startsWith('file://') ? rawUri : `file://${rawUri}`;

    // 2. Safe destination in documentDirectory
    const safeFileName = `Quotation_${String(quotation.id || 'draft').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.pdf`;
    const targetUri = `${FileSystem.documentDirectory}${safeFileName}`;

    let shareUri = formattedUri;
    try {
      await FileSystem.copyAsync({
        from: formattedUri,
        to: targetUri
      });
      const info = await FileSystem.getInfoAsync(targetUri);
      if (info.exists) {
        shareUri = targetUri;
      }
    } catch (copyErr) {
      console.warn('Could not copy to documentDirectory, proceeding with formatted uri:', copyErr);
    }

    // 3. Share via native share sheet
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(shareUri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Share Quotation ${quotation.id || ''}`
      });
      return shareUri;
    } else {
      // Fallback: Open native system print/save dialog
      await Print.printAsync({ html });
      return shareUri;
    }
  } catch (error) {
    console.warn('Sharing via shareAsync failed, invoking native print dialog as fallback:', error);
    try {
      // Direct print fallback has native "Save as PDF" on Android
      await Print.printAsync({ html });
    } catch (printErr) {
      console.error('Both shareAsync and printAsync failed:', printErr);
      throw error;
    }
  }
}

/**
 * Builds plain text summary for WhatsApp sharing or Clipboard.
 */
export function buildQuotationPlainText(quotation) {
  const {
    id = 'QT-DRAFT',
    customerName = 'Walk-in Client',
    product = 'Brochure',
    quantity = 1000,
    totalAmount = 0,
    unitPrice = 0,
    inputs = {}
  } = quotation;

  return `*SMART PRINTING PRESS, DEHRADUN*
*Quotation: ${id}*
------------------------------
Client: ${customerName}
Product: ${product}
Quantity: ${formatIndianNumber(quantity)} Pcs
Size: ${inputs.finishedWidth || '-'} × ${inputs.finishedHeight || '-'} inches
Paper: ${inputs.gsm || 130} GSM (${inputs.paperType || 'Standard'})
Sides: ${inputs.sides || 2} Sides | Colors: ${inputs.colorsPerSide || 4} Colors
------------------------------
*Unit Rate: ${formatRupee(unitPrice)} / Pc*
*TOTAL AMOUNT: ${formatRupee(totalAmount)}*
------------------------------
Valid for 15 days. GST extra if applicable.
Contact: Smart Printing Press, Dehradun`;
}
