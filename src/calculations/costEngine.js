/**
 * costEngine.js
 * Comprehensive Printing Press Costing Engine for Smart Printing Press, Dehradun.
 * Pure JavaScript, fully offline, testable, and mathematically verified.
 */

const { calculateSheetLayout } = require('./layoutEngine');

/**
 * Calculates paper weight in kilograms per ream (500 sheets).
 * Formula: (Width inches * Height inches * GSM) / 3100
 * Or metric: (Width_m * Height_m * GSM * sheetsPerReam) / 1000
 */
function calculateReamWeight(widthInches, heightInches, gsm, sheetsPerReam = 500) {
  const w = Number(widthInches) || 0;
  const h = Number(heightInches) || 0;
  const g = Number(gsm) || 0;
  const s = Number(sheetsPerReam) || 500;
  if (w <= 0 || h <= 0 || g <= 0) return 0;
  const weightKg = (w * 25.4 * h * 25.4 * g * s) / 1000000000;
  return Number(weightKg.toFixed(2));
}

/**
 * Calculates paper requirements and costs for a given form count and press sheet specs.
 */
function calculatePaperCost({
  totalForms,
  ups,
  wastagePercent = 10,
  reamPrice = 2800,
  sheetsPerReam = 500,
  fullReamPurchase = false
}) {
  const forms = Math.max(0, Number(totalForms) || 0);
  const u = Math.max(1, Number(ups) || 1);
  const wastePct = Math.max(0, Number(wastagePercent) || 0);
  const price = Math.max(0, Number(reamPrice) || 0);
  const spr = Math.max(1, Number(sheetsPerReam) || 500);

  // Base press sheets required without wastage
  const baseSheets = Math.ceil(forms / u);

  // Wastage sheets
  const wastageSheets = Math.ceil(baseSheets * (wastePct / 100));

  // Total gross press sheets needed
  const totalSheets = baseSheets + wastageSheets;

  // Reams calculated
  const exactReams = totalSheets / spr;
  const purchasedReams = fullReamPurchase ? Math.ceil(exactReams) : exactReams;
  const paperCost = purchasedReams * price;
  const costPerSheet = price / spr;

  return {
    baseSheets,
    wastageSheets,
    totalSheets,
    exactReams: Number(exactReams.toFixed(3)),
    purchasedReams: fullReamPurchase ? Math.ceil(exactReams) : Number(exactReams.toFixed(3)),
    costPerSheet: Number(costPerSheet.toFixed(2)),
    paperCost: Number(paperCost.toFixed(2))
  };
}

/**
 * Calculates offset printing press charges.
 */
function calculatePrintingCost({
  totalSheets,
  sides = 2,
  colorsPerSide = 4,
  ratePer1000PerColor = 200,
  roundTo1000Slabs = true
}) {
  const sheets = Math.max(0, Number(totalSheets) || 0);
  const s = Math.max(1, Number(sides) || 1);
  const c = Math.max(1, Number(colorsPerSide) || 1);
  const rate = Math.max(0, Number(ratePer1000PerColor) || 0);

  if (sheets <= 0) {
    return {
      chargeableSets1000: 0,
      totalImpressions: 0,
      totalRuns: 0,
      printingCost: 0
    };
  }

  // Chargeable 1,000-sheet sets (standard offset printing minimum 1 slab = 1000 sheets)
  const chargeableSets1000 = roundTo1000Slabs
    ? Math.max(1, Math.ceil(sheets / 1000))
    : sheets / 1000;

  const totalImpressions = sheets * s;
  const totalRuns = chargeableSets1000 * s * c;
  const printingCost = totalRuns * rate;

  return {
    chargeableSets1000,
    totalImpressions,
    totalRuns,
    printingCost: Number(printingCost.toFixed(2))
  };
}

/**
 * Calculates plate charges.
 */
function calculatePlateCost({
  sides = 2,
  colorsPerSide = 4,
  plateRate = 250,
  manualPlateCount = null
}) {
  const s = Math.max(1, Number(sides) || 1);
  const c = Math.max(1, Number(colorsPerSide) || 1);
  const rate = Math.max(0, Number(plateRate) || 0);

  const defaultPlateCount = s * c;
  const plates = manualPlateCount !== null && manualPlateCount !== undefined && Number(manualPlateCount) >= 0
    ? Number(manualPlateCount)
    : defaultPlateCount;

  const plateCost = plates * rate;

  return {
    plateCount: plates,
    plateRate: rate,
    plateCost: Number(plateCost.toFixed(2))
  };
}

/**
 * Calculates finishing and post-press operations cost.
 */
function calculateFinishingCost({
  quantity = 1000,
  laminationPerPiece = 0,
  dieCuttingPerPiece = 0,
  foldingPerPiece = 0.3,
  bindingPerPiece = 0,
  cuttingTotal = 300,
  otherTotal = 250
}) {
  const q = Math.max(0, Number(quantity) || 0);
  const lam = Math.max(0, Number(laminationPerPiece) || 0);
  const die = Math.max(0, Number(dieCuttingPerPiece) || 0);
  const fold = Math.max(0, Number(foldingPerPiece) || 0);
  const bind = Math.max(0, Number(bindingPerPiece) || 0);
  const cut = Math.max(0, Number(cuttingTotal) || 0);
  const other = Math.max(0, Number(otherTotal) || 0);

  const variableFinishingPerPiece = lam + die + fold + bind;
  const totalVariableFinishing = q * variableFinishingPerPiece;
  const totalFixedFinishing = cut + other;
  const totalFinishingCost = totalVariableFinishing + totalFixedFinishing;

  return {
    variablePerPiece: Number(variableFinishingPerPiece.toFixed(2)),
    totalVariableFinishing: Number(totalVariableFinishing.toFixed(2)),
    totalFixedFinishing: Number(totalFixedFinishing.toFixed(2)),
    cuttingTotal: cut,
    otherTotal: other,
    totalFinishingCost: Number(totalFinishingCost.toFixed(2))
  };
}

/**
 * Calculates profit, selling price, and unit rates according to markup or target margin.
 */
function calculateProfitAndSellingPrice({
  productionCost,
  quantity,
  profitType = 'markup', // 'markup' or 'margin'
  profitPercentage = 30
}) {
  const cost = Math.max(0, Number(productionCost) || 0);
  const q = Math.max(1, Number(quantity) || 1);
  const pct = Math.max(0, Number(profitPercentage) || 0);

  let sellingPrice = cost;
  let profitAmount = 0;
  let effectiveMarkupPct = 0;
  let effectiveMarginPct = 0;

  if (profitType === 'margin') {
    // Target Margin on selling price: SP = Cost / (1 - M)
    const marginFraction = Math.min(0.999, pct / 100);
    sellingPrice = cost > 0 && marginFraction < 1 ? cost / (1 - marginFraction) : cost;
    profitAmount = sellingPrice - cost;
    effectiveMarginPct = pct;
    effectiveMarkupPct = cost > 0 ? (profitAmount / cost) * 100 : 0;
  } else {
    // Markup on cost: SP = Cost * (1 + Markup)
    profitAmount = cost * (pct / 100);
    sellingPrice = cost + profitAmount;
    effectiveMarkupPct = pct;
    effectiveMarginPct = sellingPrice > 0 ? (profitAmount / sellingPrice) * 100 : 0;
  }

  const costPerPiece = cost / q;
  const sellingPricePerPiece = sellingPrice / q;

  return {
    profitType,
    profitPercentage: pct,
    profitAmount: Number(profitAmount.toFixed(2)),
    sellingPrice: Number(sellingPrice.toFixed(2)),
    costPerPiece: Number(costPerPiece.toFixed(2)),
    sellingPricePerPiece: Number(sellingPricePerPiece.toFixed(2)),
    effectiveMarkupPct: Number(effectiveMarkupPct.toFixed(1)),
    effectiveMarginPct: Number(effectiveMarginPct.toFixed(1))
  };
}

/**
 * Calculates GST billing additions.
 */
function calculateTax({
  amount,
  gstRate = 0,
  gstType = 'exclusive' // 'exclusive', 'inclusive', or 'none'
}) {
  const base = Math.max(0, Number(amount) || 0);
  const rate = Math.max(0, Number(gstRate) || 0);

  if (gstType === 'none' || rate === 0) {
    return {
      gstType: 'none',
      gstRate: 0,
      taxableAmount: base,
      gstAmount: 0,
      finalAmount: base
    };
  }

  if (gstType === 'inclusive') {
    const taxable = base / (1 + rate / 100);
    const gst = base - taxable;
    return {
      gstType: 'inclusive',
      gstRate: rate,
      taxableAmount: Number(taxable.toFixed(2)),
      gstAmount: Number(gst.toFixed(2)),
      finalAmount: Number(base.toFixed(2))
    };
  }

  // exclusive
  const gst = base * (rate / 100);
  const finalAmount = base + gst;
  return {
    gstType: 'exclusive',
    gstRate: rate,
    taxableAmount: Number(base.toFixed(2)),
    gstAmount: Number(gst.toFixed(2)),
    finalAmount: Number(finalAmount.toFixed(2))
  };
}

/**
 * Main master calculation function integrating all steps.
 */
function calculateJobCost(jobParams) {
  const {
    product = 'Brochure',
    quantity = 1000,
    finishedWidth = 8.5,
    finishedHeight = 11,
    sheetWidth = 20,
    sheetHeight = 30,
    margin = 0.125,
    manualUps = null,

    // Product specific copies & leaves
    leaves = 1,
    copyType = '1 — Single', // '1 — Single', '2 — Duplicate / Triplicate'
    carbonReamSheets = 500,
    carbonReamPrice = 0,
    carbonPages = 100,

    // Paper specs
    gsm = 130,
    sheetsPerReam = 500,
    reamPrice = 2800,
    wastagePercent = 10,
    fullReamPurchase = false,

    // Printing specs
    sides = 2,
    colorsPerSide = 4,
    ratePer1000PerColor = 200,

    // Plate specs
    plateRate = 250,
    manualPlateCount = null,

    // Finishing specs
    laminationPerPiece = 0,
    dieCuttingPerPiece = 0,
    foldingPerPiece = 0.3,
    bindingPerPiece = 0,
    cuttingTotal = 300,
    otherTotal = 250,

    // Profit & tax
    profitType = 'markup',
    profitPercentage = 30,
    gstRate = 0,
    gstType = 'exclusive',

    // Dual stock (cover/inner) for Booklet/Catalogue
    hasSeparateCover = false,
    coverSpecs = null
  } = jobParams;

  const q = Math.max(0, Number(quantity) || 0);
  const isBillBook = Boolean(
    (product && product.toLowerCase().includes('bill book')) ||
    jobParams.productId === 'bill_book'
  );

  if (q <= 0) {
    const layout = calculateSheetLayout({
      finishedWidth,
      finishedHeight,
      sheetWidth,
      sheetHeight,
      margin
    });
    return {
      inputs: { ...jobParams, effectiveUps: layout.ups || 1 },
      layout,
      effectiveUps: layout.ups || 1,
      totalForms: 0,
      copyMultiplier: 1,
      reamWeightKg: 0,
      paper: { baseSheets: 0, wastageSheets: 0, totalSheets: 0, exactReams: 0, purchasedReams: 0, costPerSheet: 0, paperCost: 0 },
      printing: { chargeableSets1000: 0, totalImpressions: 0, totalRuns: 0, printingCost: 0 },
      plates: { plateCount: 0, plateRate, plateCost: 0 },
      finishing: { variablePerPiece: 0, totalVariableFinishing: 0, totalFixedFinishing: 0, cuttingTotal: 0, otherTotal: 0, totalFinishingCost: 0 },
      cover: null,
      carbon: {
        isBillBook,
        carbonSheets: 0,
        carbonCost: 0,
        carbonReamSheets: Number(carbonReamSheets) || 500,
        carbonReamPrice: Number(carbonReamPrice) || 0,
        carbonPages: Number(carbonPages) || 100
      },
      productionCost: 0,
      profit: { profitType, profitPercentage, profitAmount: 0, sellingPrice: 0, costPerPiece: 0, sellingPricePerPiece: 0, effectiveMarkupPct: 0, effectiveMarginPct: 0 },
      tax: { gstType, gstRate, taxableAmount: 0, gstAmount: 0, finalAmount: 0 },
      finalAmount: 0,
      unitPrice: 0
    };
  }

  // 1. Layout Calculation
  const layout = calculateSheetLayout({
    finishedWidth,
    finishedHeight,
    sheetWidth,
    sheetHeight,
    margin
  });

  const effectiveUps = manualUps && Number(manualUps) > 0 ? Number(manualUps) : Math.max(1, layout.ups || 1);

  // 2. Forms multiplier
  let copyMultiplier = 1;
  if (copyType.includes('2') || copyType.toLowerCase().includes('duplicate')) {
    copyMultiplier = 2;
  } else if (copyType.includes('3') || copyType.toLowerCase().includes('triplicate')) {
    copyMultiplier = 3;
  }

  const l = Math.max(1, Number(leaves) || 1);
  const totalForms = q * l * copyMultiplier;

  // 3. Paper Cost Calculation
  const paperResult = calculatePaperCost({
    totalForms,
    ups: effectiveUps,
    wastagePercent,
    reamPrice,
    sheetsPerReam,
    fullReamPurchase
  });

  // 4. Printing Cost Calculation
  const printingResult = calculatePrintingCost({
    totalSheets: paperResult.totalSheets,
    sides,
    colorsPerSide,
    ratePer1000PerColor
  });

  // 5. Plate Cost Calculation
  const plateResult = calculatePlateCost({
    sides,
    colorsPerSide,
    plateRate,
    manualPlateCount
  });

  // 6. Finishing Cost Calculation
  const finishingResult = calculateFinishingCost({
    quantity: q,
    laminationPerPiece,
    dieCuttingPerPiece,
    foldingPerPiece,
    bindingPerPiece,
    cuttingTotal,
    otherTotal
  });

  // 7. Optional separate cover calculation for Booklets/Catalogues
  let coverResult = null;
  if (hasSeparateCover && coverSpecs) {
    const coverLayout = calculateSheetLayout({
      finishedWidth: coverSpecs.finishedWidth || finishedWidth * 2,
      finishedHeight: coverSpecs.finishedHeight || finishedHeight,
      sheetWidth: coverSpecs.sheetWidth || sheetWidth,
      sheetHeight: coverSpecs.sheetHeight || sheetHeight,
      margin
    });
    const coverUps = coverSpecs.manualUps || Math.max(1, coverLayout.ups || 1);
    const coverPaper = calculatePaperCost({
      totalForms: q,
      ups: coverUps,
      wastagePercent: coverSpecs.wastagePercent || wastagePercent,
      reamPrice: coverSpecs.reamPrice || 3500,
      sheetsPerReam: coverSpecs.sheetsPerReam || 500,
      fullReamPurchase: coverSpecs.fullReamPurchase || false
    });
    const coverPrinting = calculatePrintingCost({
      totalSheets: coverPaper.totalSheets,
      sides: coverSpecs.sides || 2,
      colorsPerSide: coverSpecs.colorsPerSide || 4,
      ratePer1000PerColor: coverSpecs.ratePer1000PerColor || ratePer1000PerColor
    });
    const coverPlates = calculatePlateCost({
      sides: coverSpecs.sides || 2,
      colorsPerSide: coverSpecs.colorsPerSide || 4,
      plateRate: coverSpecs.plateRate || plateRate,
      manualPlateCount: coverSpecs.manualPlateCount
    });

    const coverCost = coverPaper.paperCost + coverPrinting.printingCost + coverPlates.plateCost;
    coverResult = {
      layout: coverLayout,
      paper: coverPaper,
      printing: coverPrinting,
      plates: coverPlates,
      totalCoverCost: Number(coverCost.toFixed(2))
    };
  }

  // Carbon Paper Calculation (Bill Book only)
  const cPages = Number(carbonPages) !== undefined && !Number.isNaN(Number(carbonPages)) ? Number(carbonPages) : 100;
  const cReamSheets = Number(carbonReamSheets) !== undefined && !Number.isNaN(Number(carbonReamSheets)) ? Number(carbonReamSheets) : 500;
  const cReamPrice = Math.max(0, Number(carbonReamPrice) || 0);

  const carbonSheets = Math.ceil(q * cPages);

  const carbon =
    isBillBook && copyType === "2 — Duplicate / Triplicate" && cReamSheets > 0
      ? (carbonSheets * cReamPrice) / cReamSheets
      : 0;

  // 8. Total Production Cost
  const baseProductionCost = paperResult.paperCost +
    printingResult.printingCost +
    plateResult.plateCost +
    finishingResult.totalFinishingCost +
    carbon;

  const totalProductionCost = Number((baseProductionCost + (coverResult ? coverResult.totalCoverCost : 0)).toFixed(2));

  // 9. Profit & Selling Price
  const profitResult = calculateProfitAndSellingPrice({
    productionCost: totalProductionCost,
    quantity: q,
    profitType,
    profitPercentage
  });

  // 10. Tax & Final Amount
  const taxResult = calculateTax({
    amount: profitResult.sellingPrice,
    gstRate,
    gstType
  });

  // Ream weight estimate
  const reamWeightKg = calculateReamWeight(sheetWidth, sheetHeight, gsm, sheetsPerReam);

  return {
    inputs: { ...jobParams, effectiveUps },
    layout,
    effectiveUps,
    totalForms,
    copyMultiplier,
    reamWeightKg,
    paper: paperResult,
    printing: printingResult,
    plates: plateResult,
    finishing: finishingResult,
    cover: coverResult,
    carbon: {
      isBillBook,
      carbonSheets: isBillBook ? carbonSheets : 0,
      carbonCost: isBillBook ? Number(carbon.toFixed(2)) : 0,
      carbonReamSheets: cReamSheets,
      carbonReamPrice: cReamPrice,
      carbonPages: cPages
    },
    productionCost: totalProductionCost,
    profit: profitResult,
    tax: taxResult,
    finalAmount: taxResult.finalAmount,
    unitPrice: q > 0 ? Number((taxResult.finalAmount / q).toFixed(2)) : 0
  };
}

module.exports = {
  calculateReamWeight,
  calculateSheetLayout,
  calculatePaperCost,
  calculatePrintingCost,
  calculatePlateCost,
  calculateFinishingCost,
  calculateProfitAndSellingPrice,
  calculateTax,
  calculateJobCost
};
