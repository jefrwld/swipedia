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

  fetchTopicsOfArticle(title: string) {
    this.wikiService.getTopicsOfArticle(title).subscribe((topics: string[]) => {
      console.log("Gefundene Topics:", topics);
      this.addTopicsToLikedTopics(topics);
    });
  }
  


  dontLike() {
    this.fetchRandomArticle();
  }

  like(title: string) {
    this.fetchRandomArticle();
    this.fetchTopicsOfArticle(title);
  }

  addTopicsToLikedTopics(topics: any): void {
    if (!topics) return;
  
    const raw = localStorage.getItem('likedTopics');
    const existing: string[] = raw ? JSON.parse(raw) : [];
  
    const newTopics = Array.isArray(topics) ? topics : [topics];
    const updated = Array.from(new Set([...existing, ...newTopics]));
  
    localStorage.setItem('likedTopics', JSON.stringify(updated));
  }
  
  

}

