export interface Receipt {
  id: string;
  receiptDate: string | null;
  totalAmount: number | null;
  creationDate: string;
  items?: ReceiptItem[];
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
}
