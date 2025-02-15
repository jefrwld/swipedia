import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WikiService } from '../services/wiki.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-wiki',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Kein Module mehr, alles hier!
  templateUrl: './wiki-main.component.html',
  styleUrls: ['./wiki-main.component.css']
})

export class WikiMainComponent {
  private wikiService = inject(WikiService);
  article = signal<any>(null);

  constructor() {
    this.fetchRandomArticle();
  }

  fetchRandomArticle() {
    this.wikiService.getRandomArticle().subscribe(data => {
      this.article.set(data);
    });
  }
}

