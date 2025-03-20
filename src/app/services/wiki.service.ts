import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, map} from 'rxjs';
import {randomArticle} from '../wiki-main/interfaces';


@Injectable({
  providedIn: 'root'
})


export class WikiService {

  private readonly WIKIPEDIA_RANDOM_API = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';

  constructor(private http: HttpClient) {}

  getRandomArticle(): Observable<randomArticle> {
    let randomArticle = this.http.get<randomArticle>(this.WIKIPEDIA_RANDOM_API);
    return randomArticle
  }

  getTopicsOfArticle(title: string): Observable<string[]> {
    const encodedTitle = encodeURIComponent(title);
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=categories&titles=${encodedTitle}&format=json&origin=*`;
  
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        const pages = response?.query?.pages;
        const firstPage = pages[Object.keys(pages)[0]];
        const rawCategories = firstPage?.categories || [];
  
        return rawCategories.map((cat: any) =>
          cat.title.replace(/^Category:/, '')
        );
      })
    );
  }
  
  
  
  
}
