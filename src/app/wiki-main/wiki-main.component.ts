import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WikiService } from '../services/wiki.service';
import {switchMap} from 'rxjs/operators';
import {map} from 'rxjs';


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
    console.log("WikiService.getWikidataIdForTopic:", this.wikiService.getWikidataIdForTopic);
  }

  //get random article from wikimedia api
  fetchRandomArticle() {
    this.wikiService.getRandomArticle().subscribe(data => {
      this.article.set(data);
    });
  }

  // get related topics of an article
  fetchSemanticTopicsOfArticle(title: string) {
    this.wikiService.getSemanticTopicsOfArticle(title).subscribe(topics => {
      console.log("Semantische Themen:", topics);
      this.addTopicsToLikedTopics(topics);
    });
  }
 
  // get random article for concrete topic
  fetchArticlesForTopic(topicLabel: string) {
    this.wikiService.getWikidataIdForTopic(topicLabel).pipe(
      switchMap(topicId => this.wikiService.getArticlesForWikidataTopic(topicId)),
      map(titles => titles[Math.floor(Math.random() * titles.length)]),
      switchMap(title => this.wikiService.getArticleSummary(title))
    ).subscribe(article => {
      if (article.extract && article.extract.trim().length > 0) {
        this.article.set(article);
      } else {
        console.warn("Artikel ohne Inhalt – hole neuen.");
        this.fetchRandomArticle();
      }
    }, err => {
      console.error("Fehler bei Artikelsuche:", err);
      this.fetchRandomArticle();
    });
  }
  
 
  
  /* functions for app buttons */
  dontLike() {
    this.fetchRandomArticle();
  }
  like(title: string) {
    this.fetchSemanticTopicsOfArticle(title);
    const likedTopic = this.getRandomLikedTopicByWeight();
    if (likedTopic) {
      this.fetchArticlesForTopic(likedTopic);
    } else {
      this.fetchRandomArticle(); // Fallback, falls noch nichts geliked
    }
  }
  
  /* end button function */

  // Save topics to local storage an generate weight based on count of likes
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
  
  getRandomLikedTopicByWeight(): string | null {
    const raw = localStorage.getItem('likedTopics');
    if (!raw) return null;
  
    const counts: Record<string, { count: number; weight: number }> = JSON.parse(raw);
    const entries = Object.entries(counts);
    const totalWeight = entries.reduce((sum, [, data]) => sum + data.weight, 0);
    if (totalWeight === 0) return null;
  
    const r = Math.random() * totalWeight;
    let acc = 0;
    for (const [topic, data] of entries) {
      acc += data.weight;
      if (r <= acc) return topic;
    }
    return entries[entries.length - 1][0]; // Fallback
  }
  
}

