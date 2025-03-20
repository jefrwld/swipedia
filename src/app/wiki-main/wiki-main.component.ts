import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WikiService } from '../services/wiki.service';

@Component({
  selector: 'app-wiki',
  standalone: true,
  imports: [CommonModule],
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

  fetchTopicsOfArticle(title: string){
    let fetchedTopics = this.wikiService.getTopicsOfArticle(title);
  }


  dontLike() {
    this.fetchRandomArticle();
  }

  like(title: string) {
    console.log(title);
    this.fetchRandomArticle();
    this.fetchTopicsOfArticle(title);
  }

}

