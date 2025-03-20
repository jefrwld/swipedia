import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class WikiService {

  private readonly WIKIPEDIA_RANDOM_API = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';

  constructor(private http: HttpClient) {}

  getRandomArticle(): Observable<any> {
    let randomArticle = this.http.get<any>(this.WIKIPEDIA_RANDOM_API);
    this.getTopicsOfArticle(randomArticle.title);
    return randomArticle
  }

  getTopicsOfArticle(title: string): any {
    let title_of_article = encodeURIComponent(title);
    let WIKIPEDIA_TOPCI_API =`https://en.wikipedia.org/w/api.php?action=query&prop=categories&titles=${title_of_article}&format=json&origin=*'`;
    let topics = this.http.get<any>(WIKIPEDIA_TOPCI_API);
    console.log(topics);

  }
}
