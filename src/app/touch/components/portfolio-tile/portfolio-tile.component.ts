import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {combineLatest, map} from 'rxjs';
import {PortfolioService} from '../../services/portfolio.service';
import {BitcoinValue, PortfolioValue} from '../../models/portfolio.model';

interface PortfolioView {
  total: string;
  currency: string;
  asOf: string;
  btcPrice: string;
  btcValue: string;
  btcPct: string;
}

@Component({
  selector: 'app-portfolio-tile',
  imports: [AsyncPipe],
  templateUrl: './portfolio-tile.component.html',
  styleUrl: './portfolio-tile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioTileComponent {

  private portfolio = inject(PortfolioService);

  view$ = combineLatest([
    this.portfolio.portfolioValue$,
    this.portfolio.bitcoinValue$
  ]).pipe(
    map(([pv, btc]) => this.toView(pv, btc))
  );

  private toView(pv: PortfolioValue, btc: BitcoinValue): PortfolioView {
    return {
      total: this.formatEur(pv.total_value),
      currency: pv.currency,
      asOf: this.formatTimestamp(pv.as_of),
      btcPrice: this.formatEur(btc.current_price),
      btcValue: this.formatEur(btc.current_value),
      btcPct: btc.percentage_of_portfolio
    };
  }

  private formatEur(raw: string): string {
    const n = parseFloat(raw);
    if (isNaN(n)) return raw;
    return n.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  private formatTimestamp(raw: string): string {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'});
  }
}
