export interface ProductPriceSummary {
  name: string;
  firstPrice: number;
  latestPrice: number;
  percentChange: number;
  history: number[];
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  supermarket: string;
}
