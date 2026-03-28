import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatIconButton, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {FeedSource} from '../../models/article.model';
import {FeedConfigService} from '../../services/feed-config.service';
import {FeedFormDialogComponent} from '../../dialogs/feed-form-dialog/feed-form-dialog.component';
import {FeedDeleteDialogComponent} from '../../dialogs/feed-delete-dialog/feed-delete-dialog.component';

@Component({
  selector: 'app-feed-config',
  imports: [
    MatTableModule,
    MatIconButton,
    MatButton,
    MatIcon,
    MatSlideToggle,
    MatProgressSpinner
  ],
  templateUrl: './feed-config.component.html',
  styleUrl: './feed-config.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedConfigComponent implements OnInit {

  feeds = signal<FeedSource[]>([]);
  loading = signal(false);
  displayedColumns = ['name', 'url', 'category', 'active', 'actions'];

  constructor(
    private feedConfigService: FeedConfigService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.loadFeeds();
  }

  loadFeeds() {
    this.loading.set(true);
    this.feedConfigService.getFeeds().subscribe({
      next: (feeds) => {
        this.feeds.set(feeds);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load feeds', 'Dismiss', {duration: 5000});
        this.cdr.markForCheck();
      }
    });
  }

  openAddDialog() {
    const ref = this.dialog.open(FeedFormDialogComponent, {
      data: {},
      width: '440px'
    });
    ref.afterClosed().subscribe((result: FeedSource | undefined) => {
      if (result) {
        this.feedConfigService.createFeed(result).subscribe({
          next: () => {
            this.snackBar.open('Feed created', 'Dismiss', {duration: 3000});
            this.loadFeeds();
          },
          error: () => this.snackBar.open('Failed to create feed', 'Dismiss', {duration: 5000})
        });
      }
    });
  }

  openEditDialog(feed: FeedSource) {
    const ref = this.dialog.open(FeedFormDialogComponent, {
      data: {feed},
      width: '440px'
    });
    ref.afterClosed().subscribe((result: FeedSource | undefined) => {
      if (result) {
        this.feedConfigService.updateFeed(result).subscribe({
          next: () => {
            this.snackBar.open('Feed updated', 'Dismiss', {duration: 3000});
            this.loadFeeds();
          },
          error: () => this.snackBar.open('Failed to update feed', 'Dismiss', {duration: 5000})
        });
      }
    });
  }

  openDeleteDialog(feed: FeedSource) {
    const ref = this.dialog.open(FeedDeleteDialogComponent, {
      data: {feed}
    });
    ref.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this.feedConfigService.deleteFeed(feed.id!).subscribe({
          next: () => {
            this.snackBar.open(`Feed "${feed.name}" deleted`, 'Dismiss', {duration: 3000});
            this.loadFeeds();
          },
          error: () => this.snackBar.open('Failed to delete feed', 'Dismiss', {duration: 5000})
        });
      }
    });
  }

  toggleActive(feed: FeedSource) {
    const updated = {...feed, active: !feed.active};
    this.feedConfigService.updateFeed(updated).subscribe({
      next: () => this.loadFeeds(),
      error: () => {
        this.snackBar.open('Failed to update feed', 'Dismiss', {duration: 5000});
        this.loadFeeds();
      }
    });
  }

}
