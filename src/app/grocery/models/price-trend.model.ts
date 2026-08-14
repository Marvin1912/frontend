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
  singlePrice: number;
  supermarket?: string;
  articleName: string;
  articleId: number;
}
