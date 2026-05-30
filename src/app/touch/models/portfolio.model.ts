export interface PortfolioValue {
  total_value: string;
  currency: string;
  as_of: string;
}

export interface BitcoinValue {
  ticker: string;
  name: string;
  quantity: string;
  current_price: string;
  current_value: string;
  percentage_of_portfolio: string;
}
