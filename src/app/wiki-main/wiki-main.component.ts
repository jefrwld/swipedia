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

  fetchSemanticTopicsOfArticle(title: string) {
    this.wikiService.getSemanticTopicsOfArticle(title).subscribe(topics => {
      console.log("Semantische Themen:", topics);
      this.addTopicsToLikedTopics(topics);
    });
  }
  

  fetchArticleOfTopic(topic: string){
    this.wikiService.getArticleForTopic(topic).subscribe(data => {
      this.article.set(data);
    })
  }
  


  dontLike() {
    this.fetchRandomArticle();
  }

  like(title: string) {
    this.fetchRandomArticle();
    this.fetchSemanticTopicsOfArticle("Albert Einstein");
  }

  addTopicsToLikedTopics(topics: string | string[]): void {
    if (!topics) return;
  
    const raw = localStorage.getItem('likedTopics');
    const counts: Record<string, { count: number; weight: number }> = raw ? JSON.parse(raw) : {};
    const newTopics = Array.isArray(topics) ? topics : [topics];
  
    newTopics.forEach(topic => {
      if (typeof topic === 'string' && topic.trim() !== '') {
        if (!counts[topic]) {
          counts[topic] = { count: 0, weight: 0 };
        }
        counts[topic].count += 1;
      }
    });
  
    const totalLikes = Object.values(counts).reduce((sum, entry) => sum + entry.count, 0);
  
    Object.entries(counts).forEach(([topic, data]) => {
      data.weight = totalLikes > 0 ? +(data.count / totalLikes * 100).toFixed(2) : 0;
    });
  
    localStorage.setItem('likedTopics', JSON.stringify(counts));
  }
  

}

