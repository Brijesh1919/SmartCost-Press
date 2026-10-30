/**
 * defaultRates.js
 * Default commercial offset & digital press rates for Smart Printing Press, Dehradun.
 */

export const DEFAULT_RATES = {
  // Business Profile
  pressName: 'Smart Printing Press',
  pressSubtitle: 'Industrial Offset & Digital Press',
  location: 'Dehradun, Uttarakhand',
  phone: '+91 98765 43210',
  currency: '₹',

  // Shop floor rates
  printRatePer1000PerColor: 200,
  plateRate: 250,
  wastagePercent: 10,
  profitType: 'markup', // 'markup' or 'margin'
  profitPercentage: 30, // 30% standard
  gstRate: 0,
  gstType: 'exclusive', // 'exclusive', 'inclusive', 'none'

  // Standard Post-Press rates
  cuttingTotal: 300,
  otherTotal: 250,
  foldingPerPiece: 0.3,
  laminationPerPiece: 0.25,
  dieCuttingPerPiece: 0.25,
  bindingPerPiece: 0,

  // App preferences
  theme: 'light', // 'light', 'dark', 'system'
  language: 'en' // 'en', 'hi', 'gu'
};

