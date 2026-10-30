/**
 * currency.js
 * Indian Rupee formatting utility for Smart Printing Press.
 */

/**
 * Formats a number as Indian Currency (INR).
 * Examples:
 *   formatRupee(11000) -> "₹ 11,000.00"
 *   formatRupee(11000, false) -> "₹ 11,000"
 */
export function formatRupee(amount, includeDecimals = true) {
  const num = Number(amount) || 0;
  if (!Number.isFinite(num)) return '₹ 0.00';

  const parts = num.toFixed(includeDecimals ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian number comma separation: last 3 digits, then groups of 2
  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.substring(1);

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = includeDecimals && decimalPart
    ? `₹ ${formattedInteger}.${decimalPart}`
    : `₹ ${formattedInteger}`;

  return isNegative ? `-${result}` : result;
}

/**
 * Formats a plain number with Indian comma grouping.
 */
export function formatIndianNumber(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('en-IN');
}

