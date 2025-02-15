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
    return this.http.get<any>(this.WIKIPEDIA_RANDOM_API);
  }
}
