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

  addTopicsToLikedTopics(topics: string | string[]): void {
    if (!topics) return;
  
    const raw = localStorage.getItem('likedTopics');
    const counts: Record<string, number> = raw ? JSON.parse(raw) : {};
  
    const newTopics = Array.isArray(topics) ? topics : [topics];
  
    newTopics.forEach(topic => {
      if (typeof topic === 'string' && topic.trim() !== '') {
        counts[topic] = (counts[topic] || 0) + 1;
      }
    });
  
    localStorage.setItem('likedTopics', JSON.stringify(counts));
    //this.getAllTopics();
    this.calculateRecommendationWeights(raw);
  }

  getAllTopics() {
    let savedTopics = localStorage.getItem('likedTopics');
    console.log(savedTopics);
  
    if (savedTopics) {
      let topicsDict = JSON.parse(savedTopics);
      Object.entries(topicsDict).forEach(([topic, isLiked]) => {
        console.log(`Topic: ${topic}, Liked: ${isLiked}`);
      });
    }
  }

  calculateRecommendationWeights(topics: any){

    let topicWeights: Object = {};
    let sumOfLikes: number = 0;

    //sum of likes 
    if(topics){
      console.log("in")
      let topicDictionary: Object = JSON.parse(topics);
      console.log(topicDictionary);
      Object.entries(topicDictionary).forEach(([topic, isLiked]) => {
        sumOfLikes += Number(isLiked);
      });

      Object.entries(topicDictionary).forEach(([topic, isLiked]) => {
        
      });
    }




    
  }
  

  
  
  

}

