/**
 * layoutEngine.js
 * Pure JavaScript Sheet Layout & Ups Calculation Engine
 * Accounts for finished size, sheet size, gripper/cutting margins, and rotation.
 */

/**
 * Calculates optimal ups and sheet layout for printing.
 *
 * @param {Object} params
 * @param {number} params.finishedWidth - Finished product width in inches
 * @param {number} params.finishedHeight - Finished product height in inches
 * @param {number} params.sheetWidth - Full press sheet width in inches
 * @param {number} params.sheetHeight - Full press sheet height in inches
 * @param {number} [params.margin=0.125] - Gripper / trim margin per edge in inches
 * @returns {Object} Layout analysis result
 */
function calculateSheetLayout({
  finishedWidth,
  finishedHeight,
  sheetWidth,
  sheetHeight,
  margin = 0.125,
  forceOrientation = null
}) {
  const fw = Math.max(0, Number(finishedWidth) || 0);
  const fh = Math.max(0, Number(finishedHeight) || 0);
  const sw = Math.max(0, Number(sheetWidth) || 0);
  const sh = Math.max(0, Number(sheetHeight) || 0);
  const m = Math.max(0, Number(margin) || 0);

  // Usable sheet area after accounting for perimeter margins
  const usableWidth = Math.max(0, sw - 2 * m);
  const usableHeight = Math.max(0, sh - 2 * m);

  if (fw <= 0 || fh <= 0 || usableWidth <= 0 || usableHeight <= 0) {
    return {
      ups: 0,
      bestOrientation: 'invalid',
      straightUps: 0,
      straightCols: 0,
      straightRows: 0,
      rotatedUps: 0,
      rotatedCols: 0,
      rotatedRows: 0,
      sheetArea: sw * sh,
      usedArea: 0,
      unusedArea: sw * sh,
      utilizationPercentage: 0,
      isRotated: false
    };
  }

  // 1. Straight orientation (0°): fw along width, fh along height
  const straightCols = Math.floor(usableWidth / fw);
  const straightRows = Math.floor(usableHeight / fh);
  const straightUps = straightCols * straightRows;

  // 2. Rotated orientation (90°): fh along width, fw along height
  const rotatedCols = Math.floor(usableWidth / fh);
  const rotatedRows = Math.floor(usableHeight / fw);
  const rotatedUps = rotatedCols * rotatedRows;

  const totalSheetArea = sw * sh;

  if (straightUps === 0 && rotatedUps === 0) {
    return {
      ups: 0,
      bestOrientation: 'does_not_fit',
      straightUps: 0,
      straightCols: 0,
      straightRows: 0,
      rotatedUps: 0,
      rotatedCols: 0,
      rotatedRows: 0,
      forceOrientation,
    sheetArea: totalSheetArea,
      usedArea: 0,
      unusedArea: totalSheetArea,
      utilizationPercentage: 0,
      isRotated: false
    };
  }

  const isRotated = forceOrientation === 'rotated_90'
    ? true
    : forceOrientation === 'straight'
      ? false
      : rotatedUps > straightUps;
  const bestUps = isRotated ? rotatedUps : straightUps;
  const selectedCols = isRotated ? rotatedCols : straightCols;
  const selectedRows = isRotated ? rotatedRows : straightRows;
  const pieceWidthOnSheet = isRotated ? fh : fw;
  const pieceHeightOnSheet = isRotated ? fw : fh;
  const gridWidth = Number((selectedCols * pieceWidthOnSheet).toFixed(3));
  const gridHeight = Number((selectedRows * pieceHeightOnSheet).toFixed(3));

  const usedArea = bestUps * fw * fh;
  const unusedArea = Math.max(0, totalSheetArea - usedArea);
  const utilizationPercentage = totalSheetArea > 0
    ? Number(((usedArea / totalSheetArea) * 100).toFixed(1))
    : 0;

  let bestOrientation = 'straight';
  if (straightUps === rotatedUps) {
    bestOrientation = 'equal';
  } else if (rotatedUps > straightUps) {
    bestOrientation = 'rotated_90';
  }

  return {
    ups: bestUps,
    bestOrientation,
    isRotated,
    cols: selectedCols,
    rows: selectedRows,
    pieceWidthOnSheet,
    pieceHeightOnSheet,
    gridWidth,
    gridHeight,
    straightUps,
    straightCols,
    straightRows,
    rotatedUps,
    rotatedCols,
    rotatedRows,
    forceOrientation,
    sheetArea: totalSheetArea,
    usedArea: Number(usedArea.toFixed(2)),
    unusedArea: Number(unusedArea.toFixed(2)),
    utilizationPercentage
  };
}

module.exports = {
  calculateSheetLayout
};

