import {MatDialogClose} from '@angular/material/dialog';
import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-article-dialog',
  imports: [
    MatDialogClose
  ],
  templateUrl: './article-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ArticleDialogComponent {
  articles: string[] = ['a', 'an'];
}
