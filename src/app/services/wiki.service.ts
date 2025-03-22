import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, map, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {randomArticle} from '../wiki-main/interfaces';
import { HttpParams } from '@angular/common/http';  


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


  getSemanticTopicsOfArticle(title: string): Observable<string[]> {
    const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageprops&format=json&origin=*`;
    return this.http.get<any>(wikipediaUrl).pipe(
      map(response => {
        const pages = response.query.pages;
        const firstPage = pages[Object.keys(pages)[0]];
        const wikidataId = firstPage?.pageprops?.wikibase_item;
        if (!wikidataId) throw new Error("No Wikidata Id found");
        return wikidataId;
      }),
      // Jetzt HTTP-Request an Wikidata
      switchMap((wikidataId: string) => {
        const wikidataUrl = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`;
        return this.http.get<any>(wikidataUrl);
      }),
      map(wikidata => {
        const entity = Object.values(wikidata.entities)[0] as any;
        const claims = entity.claims;
        const topicIds: string[] = [];
        // Relevante Properties 
        const relevantProperties = ['P101', 'P921', 'P106', 'P136', 'P410', 'P361', 'P31'];

        relevantProperties.forEach(prop => {
          if (claims[prop]) {
            claims[prop].forEach((claim: any) => {
              const id = claim.mainsnak?.datavalue?.value?.id;
              if (id) topicIds.push(id);
            });
          }
        });
        return topicIds; 
      }),
      switchMap((topicIds: string[]) => {
        if (topicIds.length === 0) return of([]);
        const idsStr = topicIds.join('|');
        const labelUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${idsStr}&format=json&languages=en&props=labels&origin=*`;
        return this.http.get<any>(labelUrl).pipe(
          map(labelResponse => {
            const entities = labelResponse.entities;
            return Object.values(entities).map((e: any) => e.labels?.en?.value).filter(Boolean);
          })
        );
      })
    );
  }
  

  getArticlesForWikidataTopic(topicId: string): Observable<string[]> {
    const query = `
    SELECT ?articleTitle WHERE {
      {
        ?item wdt:P921 wd:${topicId} .
      } UNION {
        ?item wdt:P106 wd:${topicId} .
      } UNION {
        ?item wdt:P101 wd:${topicId} .
      }
      ?article schema:about ?item .
      ?article schema:isPartOf <https://en.wikipedia.org/> .
      ?article schema:name ?articleTitle .
    }
    LIMIT 50
  `;
  
    const url = 'https://query.wikidata.org/sparql';
    const headers = { 'Accept': 'application/sparql-results+json' };
    const params = new HttpParams().set('query', query);
  
    return this.http.get<any>(url, { headers, params }).pipe(
      map(response => {
        const results = response.results?.bindings || [];
        return results.map((r: any) => r.articleTitle.value);
      })
    );
 }
 
 getWikidataIdForTopic(topicLabel: string): Observable<string> {
  const url = `https://www.wikidata.org/w/api.php`;
  const params = new HttpParams()
    .set('action', 'wbsearchentities')
    .set('search', topicLabel)
    .set('language', 'en')
    .set('format', 'json')
    .set('origin', '*');

  return this.http.get<any>(url, { params }).pipe(
    map(response => {
      const results = response.search;
      if (!results || results.length === 0) throw new Error('Keine Wikidata-ID gefunden');
      return results[0].id; // z. B. "Q413"
    })
  );
}


getArticleSummary(title: string): Observable<any> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  return this.http.get<any>(url);
}







  
  
  
  
}
