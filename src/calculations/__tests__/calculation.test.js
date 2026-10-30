/**
 * calculation.test.js
 * Comprehensive unit tests for Printing Press Costing & Layout Engines.
 * Run directly with Node: node src/calculations/__tests__/calculation.test.js
 */

const assert = require('assert');
const { calculateSheetLayout } = require('../layoutEngine');
const {
  calculateReamWeight,
  calculatePaperCost,
  calculatePrintingCost,
  calculatePlateCost,
  calculateFinishingCost,
  calculateProfitAndSellingPrice,
  calculateTax,
  calculateJobCost
} = require('../costEngine');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

console.log('--- RUNNING CALCULATION ENGINE TESTS ---');

// Test 1: Ups and sheet requirements
it('calculates optimal ups for standard A4 / Letter (8.5x11) on 20x30 sheet', () => {
  const result = calculateSheetLayout({
    finishedWidth: 8.5,
    finishedHeight: 11,
    sheetWidth: 20,
    sheetHeight: 30,
    margin: 0.125
  });
  // Usable: (20 - 0.25) = 19.75, (30 - 0.25) = 29.75
  // Straight: floor(19.75 / 8.5) = 2, floor(29.75 / 11) = 2 -> 4 ups
  // Rotated: floor(19.75 / 11) = 1, floor(29.75 / 8.5) = 3 -> 3 ups
  assert.strictEqual(result.ups, 4);
  assert.strictEqual(result.bestOrientation, 'straight');
  assert.strictEqual(result.isRotated, false);
  assert.ok(result.utilizationPercentage > 50);
});

it('correctly identifies rotated 90° orientation when rotation yields more ups', () => {
  // Finished 9x4 on 20x30 sheet:
  // Straight: floor(19.75 / 9) = 2, floor(29.75 / 4) = 7 -> 14 ups
  // Rotated: floor(19.75 / 4) = 4, floor(29.75 / 9) = 3 -> 12 ups
  // Let's test with a case where rotated yields more:
  // Finished 13x6 on 20x30:
  // Straight: floor(19.75/13)=1, floor(29.75/6)=4 -> 4 ups
  // Rotated: floor(19.75/6)=3, floor(29.75/13)=2 -> 6 ups
  const result = calculateSheetLayout({
    finishedWidth: 13,
    finishedHeight: 6,
    sheetWidth: 20,
    sheetHeight: 30,
    margin: 0.125
  });
  assert.strictEqual(result.ups, 6);
  assert.strictEqual(result.isRotated, true);
  assert.strictEqual(result.bestOrientation, 'rotated_90');
});

it('accurately calculates sticker layout 4x3 on 20x30 sheet (42 ups: 6 cols x 7 rows)', () => {
  const result = calculateSheetLayout({
    finishedWidth: 4,
    finishedHeight: 3,
    sheetWidth: 20,
    sheetHeight: 30,
    margin: 0.125
  });
  // Usable: 19.75 x 29.75
  // Straight: floor(19.75/4)=4, floor(29.75/3)=9 -> 36 ups
  // Rotated: floor(19.75/3)=6, floor(29.75/4)=7 -> 42 ups
  assert.strictEqual(result.ups, 42);
  assert.strictEqual(result.isRotated, true);
  assert.strictEqual(result.cols, 6);
  assert.strictEqual(result.rows, 7);
  assert.strictEqual(result.pieceWidthOnSheet, 3);
  assert.strictEqual(result.pieceHeightOnSheet, 4);
  assert.strictEqual(result.gridWidth, 18);
  assert.strictEqual(result.gridHeight, 28);
  assert.strictEqual(result.usedArea, 504);
  assert.strictEqual(result.unusedArea, 96);
  assert.strictEqual(result.utilizationPercentage, 84);
});

// Test 2: Wastage calculation
it('calculates paper wastage percentage correctly', () => {
  // 1000 forms / 4 ups = 250 base sheets
  // 10% wastage = ceil(250 * 0.10) = 25 sheets
  // Total = 275 sheets
  const paper = calculatePaperCost({
    totalForms: 1000,
    ups: 4,
    wastagePercent: 10,
    reamPrice: 2800,
    sheetsPerReam: 500
  });
  assert.strictEqual(paper.baseSheets, 250);
  assert.strictEqual(paper.wastageSheets, 25);
  assert.strictEqual(paper.totalSheets, 275);
  assert.strictEqual(paper.exactReams, 0.55);
  assert.strictEqual(paper.paperCost, 1540); // 0.55 * 2800
});

// Test 3: Full ream purchase vs consumption basis
it('calculates full ream purchase basis when required', () => {
  const paper = calculatePaperCost({
    totalForms: 1000,
    ups: 4,
    wastagePercent: 10,
    reamPrice: 2800,
    sheetsPerReam: 500,
    fullReamPurchase: true
  });
  assert.strictEqual(paper.purchasedReams, 1);
  assert.strictEqual(paper.paperCost, 2800);
});

// Test 4: Printing charges
it('calculates offset printing cost with 1000-sheet slabs', () => {
  // 275 sheets -> 1 slab of 1000 sheets
  // 2 sides, 4 colors per side -> 8 runs
  // 8 * 200 = 1600
  const print = calculatePrintingCost({
    totalSheets: 275,
    sides: 2,
    colorsPerSide: 4,
    ratePer1000PerColor: 200
  });
  assert.strictEqual(print.chargeableSets1000, 1);
  assert.strictEqual(print.totalRuns, 8);
  assert.strictEqual(print.printingCost, 1600);
});

it('calculates multi-slab printing cost for 2500 sheets', () => {
  // 2500 sheets -> 3 slabs of 1000 sheets
  // 1 side, 1 color -> 3 runs
  // 3 * 150 = 450
  const print = calculatePrintingCost({
    totalSheets: 2500,
    sides: 1,
    colorsPerSide: 1,
    ratePer1000PerColor: 150
  });
  assert.strictEqual(print.chargeableSets1000, 3);
  assert.strictEqual(print.totalRuns, 3);
  assert.strictEqual(print.printingCost, 450);
});

// Test 5: Plate charges
it('calculates plate count and total plate cost', () => {
  // 2 sides * 4 colors = 8 plates
  // 8 * 250 = 2000
  const plates = calculatePlateCost({
    sides: 2,
    colorsPerSide: 4,
    plateRate: 250
  });
  assert.strictEqual(plates.plateCount, 8);
  assert.strictEqual(plates.plateCost, 2000);
});

it('supports manual plate count override', () => {
  const plates = calculatePlateCost({
    sides: 2,
    colorsPerSide: 4,
    plateRate: 250,
    manualPlateCount: 4
  });
  assert.strictEqual(plates.plateCount, 4);
  assert.strictEqual(plates.plateCost, 1000);
});

// Test 6: Finishing costs
it('calculates variable finishing and fixed cutting charges', () => {
  const finish = calculateFinishingCost({
    quantity: 1000,
    foldingPerPiece: 0.3,
    laminationPerPiece: 0.5,
    cuttingTotal: 300,
    otherTotal: 250
  });
  assert.strictEqual(finish.totalVariableFinishing, 800); // 1000 * 0.8
  assert.strictEqual(finish.totalFixedFinishing, 550); // 300 + 250
  assert.strictEqual(finish.totalFinishingCost, 1350);
});

// Test 7: Strict Markup vs Target Margin distinction
it('calculates markup on cost correctly', () => {
  // Cost = 1000, 30% markup -> Profit = 300, Selling Price = 1300
  const markup = calculateProfitAndSellingPrice({
    productionCost: 1000,
    quantity: 100,
    profitType: 'markup',
    profitPercentage: 30
  });
  assert.strictEqual(markup.profitAmount, 300);
  assert.strictEqual(markup.sellingPrice, 1300);
  assert.strictEqual(markup.sellingPricePerPiece, 13);
  assert.strictEqual(markup.effectiveMarkupPct, 30);
  assert.ok(Math.abs(markup.effectiveMarginPct - 23.1) < 0.2); // 300 / 1300 = 23.08%
});

it('calculates target margin on selling price correctly', () => {
  // Cost = 750, 25% target margin -> SP = 750 / (1 - 0.25) = 1000, Profit = 250
  const margin = calculateProfitAndSellingPrice({
    productionCost: 750,
    quantity: 50,
    profitType: 'margin',
    profitPercentage: 25
  });
  assert.strictEqual(margin.sellingPrice, 1000);
  assert.strictEqual(margin.profitAmount, 250);
  assert.strictEqual(margin.effectiveMarginPct, 25);
  assert.strictEqual(margin.effectiveMarkupPct, 33.3); // 250 / 750 = 33.3%
});

// Test 8: Zero quantities and invalid inputs
it('handles zero quantity and boundary inputs gracefully without throwing', () => {
  const job = calculateJobCost({
    quantity: 0,
    finishedWidth: 0,
    finishedHeight: 0,
    sheetWidth: 0,
    sheetHeight: 0
  });
  assert.strictEqual(job.productionCost, 0);
  assert.strictEqual(job.unitPrice, 0);
  assert.strictEqual(job.finalAmount, 0);
  assert.strictEqual(job.layout.ups, 0);
});

// Test 9: Multiple paper stocks (Dual stock for Booklets)
it('calculates separate cover stock and inner stock for Catalogues', () => {
  const job = calculateJobCost({
    product: 'Booklet / Catalogue',
    quantity: 500,
    finishedWidth: 8.5,
    finishedHeight: 11,
    sheetWidth: 20,
    sheetHeight: 30,
    leaves: 4, // 16 pages inner = 4 sheets
    gsm: 130,
    reamPrice: 2800,
    hasSeparateCover: true,
    coverSpecs: {
      finishedWidth: 17, // Open cover A3 size
      finishedHeight: 11,
      sheetWidth: 20,
      sheetHeight: 30,
      reamPrice: 4200, // 300 GSM Art Board
      sides: 2,
      colorsPerSide: 4,
      ratePer1000PerColor: 200
    }
  });
  assert.ok(job.cover !== null);
  assert.ok(job.cover.totalCoverCost > 0);
  assert.ok(job.productionCost > job.paper.paperCost);
  // Reconcile total:
  const expectedTotal = Number((
    job.paper.paperCost +
    job.printing.printingCost +
    job.plates.plateCost +
    job.finishing.totalFinishingCost +
    job.cover.totalCoverCost
  ).toFixed(2));
  assert.strictEqual(job.productionCost, expectedTotal);
});

// Test 10: Total reconciliation for complete job
it('reconciles complete job costing mathematics and unit prices', () => {
  const job = calculateJobCost({
    product: 'Brochure',
    quantity: 1000,
    finishedWidth: 8.5,
    finishedHeight: 11,
    sheetWidth: 20,
    sheetHeight: 30,
    gsm: 130,
    reamPrice: 2800,
    sides: 2,
    colorsPerSide: 4,
    ratePer1000PerColor: 200,
    plateRate: 250,
    foldingPerPiece: 0.3,
    cuttingTotal: 300,
    otherTotal: 250,
    profitType: 'markup',
    profitPercentage: 30,
    gstRate: 12,
    gstType: 'exclusive'
  });

  // Paper: 1000 forms / 4 ups = 250 + 25 waste = 275 sheets -> 0.55 reams * 2800 = 1540
  assert.strictEqual(job.paper.paperCost, 1540);
  // Print: 1 slab * 2 sides * 4 colors * 200 = 1600
  assert.strictEqual(job.printing.printingCost, 1600);
  // Plate: 8 plates * 250 = 2000
  assert.strictEqual(job.plates.plateCost, 2000);
  // Finishing: 1000 * 0.3 (fold) = 300 + 300 (cut) + 250 (other) = 850
  assert.strictEqual(job.finishing.totalFinishingCost, 850);
  // Base Production Cost = 1540 + 1600 + 2000 + 850 = 5990
  assert.strictEqual(job.productionCost, 5990);
  // Markup 30% of 5990 = 1797 -> SP = 7787
  assert.strictEqual(job.profit.sellingPrice, 7787);
  // GST 12% on 7787 = 934.44 -> Final = 8721.44
  assert.strictEqual(job.tax.gstAmount, 934.44);
  assert.strictEqual(job.finalAmount, 8721.44);
  // Unit price = 8721.44 / 1000 = 8.72
  assert.strictEqual(job.unitPrice, 8.72);
});

// Test 11: Bill Book Carbon Paper Calculations
it('calculates Bill Book carbon paper cost correctly for Duplicate / Triplicate copy type', () => {
  const job = calculateJobCost({
    productId: 'bill_book',
    product: 'Bill Book',
    quantity: 20,
    leaves: 100,
    copyType: '2 — Duplicate / Triplicate',
    carbonReamSheets: 500,
    carbonReamPrice: 350,
    carbonPages: 100,
    finishedWidth: 5.5,
    finishedHeight: 8.5,
    sheetWidth: 18,
    sheetHeight: 25,
    gsm: 70,
    reamPrice: 1200,
    sides: 1,
    colorsPerSide: 1,
    ratePer1000PerColor: 200,
    plateRate: 250,
    cuttingTotal: 100,
    otherTotal: 100,
    profitType: 'markup',
    profitPercentage: 20,
    gstRate: 0
  });

  // carbonSheets = Math.ceil(20 * 100) = 2000
  assert.strictEqual(job.carbon.isBillBook, true);
  assert.strictEqual(job.carbon.carbonSheets, 2000);
  // carbon = (2000 * 350) / 500 = 1400
  assert.strictEqual(job.carbon.carbonCost, 1400);

  // Verify carbon cost is included in productionCost
  const expectedBase = job.paper.paperCost +
    job.printing.printingCost +
    job.plates.plateCost +
    job.finishing.totalFinishingCost +
    1400;
  assert.strictEqual(job.productionCost, Number(expectedBase.toFixed(2)));
  // Verify profit and final amount reflect carbon cost
  assert.strictEqual(job.profit.profitAmount, Number((job.productionCost * 0.2).toFixed(2)));
  assert.strictEqual(job.profit.sellingPrice, Number((job.productionCost + job.profit.profitAmount).toFixed(2)));
});

it('produces zero carbon cost for Bill Book with single copy', () => {
  const job = calculateJobCost({
    productId: 'bill_book',
    product: 'Bill Book',
    quantity: 20,
    leaves: 100,
    copyType: '1 — Single',
    carbonReamSheets: 500,
    carbonReamPrice: 350,
    carbonPages: 100,
    finishedWidth: 5.5,
    finishedHeight: 8.5,
    sheetWidth: 18,
    sheetHeight: 25,
    gsm: 70,
    reamPrice: 1200
  });

  assert.strictEqual(job.carbon.isBillBook, true);
  assert.strictEqual(job.carbon.carbonSheets, 2000);
  assert.strictEqual(job.carbon.carbonCost, 0); // single copy = 0 carbon cost
});

it('produces zero carbon cost for Bill Book when carbonReamPrice is 0 (default)', () => {
  const job = calculateJobCost({
    productId: 'bill_book',
    product: 'Bill Book',
    quantity: 20,
    leaves: 100,
    copyType: '2 — Duplicate / Triplicate',
    carbonReamSheets: 500,
    carbonReamPrice: 0,
    carbonPages: 100,
    finishedWidth: 5.5,
    finishedHeight: 8.5,
    sheetWidth: 18,
    sheetHeight: 25
  });

  assert.strictEqual(job.carbon.isBillBook, true);
  assert.strictEqual(job.carbon.carbonSheets, 2000);
  assert.strictEqual(job.carbon.carbonCost, 0);
});

it('ensures non-Bill Book products produce zero carbon cost and have isBillBook false', () => {
  const job = calculateJobCost({
    productId: 'brochure',
    product: 'Brochure',
    quantity: 1000,
    finishedWidth: 8.5,
    finishedHeight: 11,
    sheetWidth: 20,
    sheetHeight: 30,
    carbonReamSheets: 500,
    carbonReamPrice: 500,
    carbonPages: 100,
    copyType: '2 — Duplicate / Triplicate'
  });

  assert.strictEqual(job.carbon.isBillBook, false);
  assert.strictEqual(job.carbon.carbonCost, 0);
  assert.strictEqual(job.carbon.carbonSheets, 0);
});

console.log(`\nAll ${passedTests} / ${totalTests} calculation tests passed successfully! ✨`);
