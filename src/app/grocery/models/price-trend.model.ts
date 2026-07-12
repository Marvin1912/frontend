export interface ProductPriceSummary {
  groupId: number;
  groupName: string;
  firstPrice: number;
  latestPrice: number;
  percentChange: number;
  sparklinePrices: number[];
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  supermarket: string;
  articleName: string;
}
