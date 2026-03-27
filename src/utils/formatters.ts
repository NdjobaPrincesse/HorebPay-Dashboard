/**
 * Formats a number as currency in XOF (CFA Franc) with 2 decimal places.
 * @param val - The amount to format
 * @returns Formatted string like "1 234,56 F CFA"
 */
/**
 * Main balance: integer display (0 decimals)
 */
export const formatCurrency = (val: number): string => {
  if (isNaN(val)) return '0 F CFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

/**
 * Formats bonus/soldeBonus with 2–4 decimal places and "FCFA" suffix.
 * Uses full currency formatting for consistency.
 * @param val - The bonus amount
 * @returns Formatted string like "0,0000 FCFA"
 */
/**
 * Bonus: always 3 decimal places (big decimal style)
 */
export const formatBonus = (val: number): string => {
  if (isNaN(val)) return '0,000 F CFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(val);
};

/**
 * Normalizes transaction/payment status strings to standardized values.
 * @param status - Raw status from backend
 * @returns 'SUCCESS', 'FAILED', or 'PENDING'
 */
export const normalizeStatus = (status: any): string => {
  if (!status) return 'PENDING';
  const s = String(status).toUpperCase().trim();
  if (['SUCCESS', 'SUCCES', 'PAYE', 'PAID', 'COMPLETED', 'TERMINÉ'].includes(s)) return 'SUCCESS';
  if (['FAILED', 'ECHEC', 'CANCELLED', 'REJETÉ', 'REJETE'].includes(s)) return 'FAILED';
  return 'PENDING';
};

/**
 * Cleans a string for search/filtering: lowercase, remove accents, trim.
 * @param str - Input string (nullable/undefined)
 * @returns Cleaned lowercase string (empty string if input is falsy)
 */
export const cleanStr = (str: string | null | undefined): string => {
  if (str == null) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};
