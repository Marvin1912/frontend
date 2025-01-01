import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule, Sort} from '@angular/material/sort';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {MatCard} from '@angular/material/card';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatInputModule, MatButtonModule, MatSortModule, MatSelectModule, FormsModule, MatCard],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnChanges {

  @Input() data: any[] = [];

  displayedColumns: string[] = [];
  filteredData: any[] = [];
  filterValues: { [key: string]: any } = {};
  uniqueColumnValues: { [key: string]: any[] } = {};

  filterableColumns = ['creditDebitCode', 'firstOfMonth', 'entryInfo'];

  amountSum: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data && this.data.length > 0) {
      this.displayedColumns = Object.keys(this.data[0]);
      this.filteredData = [...this.data];

      this.filterableColumns.forEach(column => {
        this.uniqueColumnValues[column] = Array.from(new Set(this.data.map(row => row[column])));
      });

      this.calculateAmountSum();
    }
  }

  sortData(sort: Sort): void {
    const {active, direction} = sort;

    if (!active || direction === '') {
      this.filteredData = [...this.filteredData];
      return;
    }

    this.filteredData = [...this.filteredData].sort((a, b) => {
      const valueA = a[active];
      const valueB = b[active];

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
    this.filteredData = this.data.filter(row => {
      return this.filterableColumns.every(column => {
        if (!this.filterValues[column]) {
          return true;
        }
        return row[column] === this.filterValues[column];
      });
    });
    this.calculateAmountSum();
  }

  resetFilters(): void {
    this.filterValues = {};
    this.filteredData = [...this.data];
    this.calculateAmountSum();
  }

  calculateAmountSum(): void {
    this.amountSum = Math.round(this.filteredData.reduce((sum, row) => sum + (row.amount || 0), 0) * 100) / 100;
  }

  removeEntry(row: any): void {
    this.filteredData = this.filteredData.filter((item) => item !== row);
    this.calculateAmountSum();
  }
}
