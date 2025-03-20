import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {randomArticle} from '../wiki-main/interfaces';


@Injectable({
  providedIn: 'root'
})


export class WikiService {

  private readonly WIKIPEDIA_RANDOM_API = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';

  constructor(private http: HttpClient) {}

  getRandomArticle(): Observable<randomArticle> {
    let randomArticle = this.http.get<randomArticle>(this.WIKIPEDIA_RANDOM_API);
    randomArticle.subscribe(article => {
      this.getTopicsOfArticle(article.title);
    })
    return randomArticle
  }

  getTopicsOfArticle(title: string): void {
    const titleEncoded = encodeURIComponent(title);
    const WIKIPEDIA_TOPIC_API = `https://en.wikipedia.org/w/api.php?action=query&prop=categories&titles=${titleEncoded}&format=json&origin=*`;
  
    this.http.get<any>(WIKIPEDIA_TOPIC_API).subscribe(response => {
      const pages = response.query.pages;
      const firstPage = pages[Object.keys(pages)[0]];
      console.log('Kategorien:', firstPage.categories);
    });
  }
  
}
