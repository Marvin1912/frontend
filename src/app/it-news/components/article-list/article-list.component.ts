import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Article, ArticlePage, FeedSource} from '../../models/article.model';
import {ArticleService} from '../../services/article.service';

@Component({
  selector: 'app-article-list',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleListComponent implements OnInit {

  articles: Article[] = [];
  sources: FeedSource[] = [];
  filteredSources: FeedSource[] = [];
  categories: string[] = [];

  selectedCategory = '';
  selectedSource = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  fetching = false;

  constructor(
    private articleService: ArticleService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadSources();
    this.loadArticles();
  }

  loadSources(): void {
    this.articleService.getSources().subscribe(sources => {
      this.sources = sources;
      this.categories = [...new Set(sources.map(s => s.category))];
      this.updateFilteredSources();
      this.cdr.markForCheck();
    });
  }

  loadArticles(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.articleService
      .getArticles(
        this.currentPage,
        20,
        this.selectedCategory || undefined,
        this.selectedSource || undefined
      )
      .subscribe({
        next: (page: ArticlePage) => {
          this.articles = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  updateFilteredSources(): void {
    this.filteredSources = this.selectedCategory
      ? this.sources.filter(s => s.category === this.selectedCategory)
      : [...this.sources];
  }

  onCategoryChange(): void {
    this.updateFilteredSources();
    if (this.selectedSource &&
        !this.filteredSources.some(s => s.name === this.selectedSource)) {
      this.selectedSource = '';
    }
    this.currentPage = 0;
    this.loadArticles();
  }

  onSourceChange(): void {
    this.currentPage = 0;
    this.loadArticles();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadArticles();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadArticles();
    }
  }

  refreshFeeds(): void {
    this.fetching = true;
    this.cdr.markForCheck();
    this.articleService.triggerFetch().subscribe({
      next: () => {
        this.fetching = false;
        this.currentPage = 0;
        this.loadArticles();
      },
      error: () => {
        this.fetching = false;
        this.cdr.markForCheck();
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
