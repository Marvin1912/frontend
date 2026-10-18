import {Supermarket} from './receipt.model';

/** ui-styles palette used for a supermarket's badge, chart line and legend. */
export type SupermarketPalette = 'sky' | 'amber' | 'rose';

export interface SupermarketOption {
  value: Supermarket;
  label: string;
  palette: SupermarketPalette;
  color: string;
}

export const SUPERMARKETS: SupermarketOption[] = [
  {value: 'LIDL', label: 'Lidl', palette: 'sky', color: '#38bdf8'},
  {value: 'EDEKA', label: 'Edeka', palette: 'amber', color: '#fbbf24'},
  {value: 'REWE', label: 'Rewe', palette: 'rose', color: '#fb7185'}
];

/** Color for supermarkets the backend did not report (or reports unknown values for). */
export const UNKNOWN_SUPERMARKET_COLOR = '#7a93b0';

export function findSupermarket(value: string | null | undefined): SupermarketOption | undefined {
  return SUPERMARKETS.find(s => s.value === value);
}
