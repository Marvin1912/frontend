import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule, Sort} from '@angular/material/sort';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {MatCard} from '@angular/material/card';
import {BookingEntry} from '../model/BookingEntry';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatSortModule, MatSelectModule, FormsModule, MatCard],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnChanges {

  static readonly COLUMN_FILTER = ['creditDebitCode', 'debitIban', 'debitName', 'firstOfMonth']

  @Input() data?: BookingEntry[] = [];

  displayedColumns: string[] = [];
  filteredData?: BookingEntry[] = [];
  filterValues: { [key: string]: any } = {};
  uniqueColumnValues: { [key: string]: any[] } = {};

  filterableColumns = ['creditDebitCode', 'firstOfMonth', 'entryInfo'];

  amountSum: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data && this.data.length > 0) {
      this.displayedColumns = Object.keys(this.data[0])
        .filter(value => TableComponent.COLUMN_FILTER.indexOf(value) === -1);
      this.filteredData = [...this.data];

      this.filterableColumns.forEach(column => {
        const key = column as keyof BookingEntry;
        this.uniqueColumnValues[key] = Array.from(new Set(this.data?.map(row => row[key])));
      });

      this.calculateAmountSum();
    }
  }

  sortData(sort: Sort): void {
    const {active, direction} = sort;

    const key = active as keyof BookingEntry;

    if (!key || direction === '') {
      this.filteredData = [...this.filteredData ?? []];
      return;
    }

    this.filteredData = [...this.filteredData ?? []].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      let comparison = 0;

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        comparison = valueA.localeCompare(valueB);
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  applyFilter(): void {
    this.filteredData = this.data?.filter(row => {
      return this.filterableColumns.every(column => {
        let key = column as keyof BookingEntry;
        if (!this.filterValues[key]) {
          return true;
        }
        return row[key] === this.filterValues[key];
      });
    });
    this.calculateAmountSum();
  }

  resetFilters(): void {
    this.filterValues = {};
    this.filteredData = [...this.data ?? []];
    this.calculateAmountSum();
  }

  calculateAmountSum(): void {
    let reduction = this.filteredData?.reduce((sum, row) => sum + (row.amount || 0), 0) ?? 0;
    this.amountSum = Math.round(reduction * 100) / 100;
  }

  removeEntry(row: any): void {
    this.filteredData = this.filteredData?.filter((item) => item !== row);
    this.calculateAmountSum();
  }
}
