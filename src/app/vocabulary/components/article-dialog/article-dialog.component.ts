import {MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-article-dialog',
  imports: [
    MatButton,
    FormsModule,
    MatDialogContent,
    MatDialogTitle,
    MatDialogClose
  ],
  templateUrl: './article-dialog.component.html',
  styleUrl: './article-dialog.component.css'
})
export class ArticleDialogComponent {

  articles: string[] = ['a', 'an'];

}
