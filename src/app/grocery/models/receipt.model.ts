export type Supermarket = 'LIDL' | 'EDEKA' | 'REWE';

export interface Receipt {
  id: string;
  receiptDate: string | null;
  totalAmount: number | null;
  creationDate: string;
  items?: ReceiptItem[];
  supermarket: Supermarket | null;
}

export interface ReceiptItem {
  id: string;
  name: string;
  singlePrice: number;
  quantity: number;
  price: number;
}
