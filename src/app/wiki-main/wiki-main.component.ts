import {
  Component,
  inject,
  signal,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WikiService } from '../services/wiki.service';
import { switchMap } from 'rxjs/operators';
import { map } from 'rxjs';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { MyHammerConfig } from '../gesture-config';

declare const Hammer: any;

@Component({
  selector: 'app-wiki',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig,
    },
  ],
  templateUrl: './wiki-main.component.html',
  styleUrls: ['./wiki-main.component.css'],
})
export class WikiMainComponent implements AfterViewInit {
  private wikiService = inject(WikiService);
  article = signal<any>(null);
  topicNotification = '';

  @ViewChild('wrapperRef') wrapperRef!: ElementRef;

  constructor() {
    this.fetchRandomArticle();
  }

  ngAfterViewInit() {
    const el = this.wrapperRef.nativeElement;
    const hammertime = new Hammer(el);

    hammertime.on('swipeleft swiperight', (ev: any) => {
      console.log('Manuell erkannt via HammerJS:', ev.type);
      if (ev.type === 'swipeleft') {
        this.onSwipeLeft();
      } else if (ev.type === 'swiperight') {
        this.onSwipeRight();
      }
    });
  }

  onTouchStart(event: TouchEvent) {
    console.log('Touchstart erkannt!', event);
  }

  onSwipeLeft() {
    console.log('Nach links gewischt');
    this.dontlike();
  }

  onSwipeRight() {
    console.log('Nach rechts gewischt');
    const art = this.article();
    if (art) {
      this.like(art.title);
    }
  }

  fetchRandomArticle() {
    this.wikiService.getRandomArticle().subscribe((data) => {
      this.article.set(data);
    });
  }

  fetchSemanticTopicsOfArticle(title: string) {
    this.wikiService.getSemanticTopicsOfArticle(title).subscribe((topics) => {
      this.addTopicsToLikedTopics(topics);
    });
  }

  fetchArticlesForTopic(topicLabel: string) {
    this.wikiService
      .getWikidataIdForTopic(topicLabel)
      .pipe(
        switchMap((topicId) =>
          this.wikiService.getArticlesForWikidataTopic(topicId).pipe(
            map((titles) => {
              if (!titles || titles.length === 0) return null;
              const randomTitle =
                titles[Math.floor(Math.random() * titles.length)];
              return randomTitle;
            })
          )
        ),
        switchMap((title) => {
          if (!title) {
            this.topicNotification = 'random artikel';
            return this.wikiService.getRandomArticle();
          }
          return this.wikiService.getArticleSummary(title);
        })
      )
      .subscribe(
        (article) => {
          if (article?.extract?.trim()?.length > 0) {
            this.article.set(article);
            const weight = this.getTopicWeight(topicLabel);
            this.topicNotification = weight !== null
              ? ` matches your interest in topic: ${topicLabel} (${weight.toFixed(1)} %)`
              : ` matches your interest in topic: ${topicLabel}`;
          } else {
            this.fetchRandomArticle();
          }
        },
        (err) => {
          console.error('Fehler bei Artikelsuche:', err);
          this.fetchRandomArticle();
        }
      );
  }

  dontlike() {
    this.showNextArticleBasedOnInterestOrRandom('dislike');
  }

  like(title: string) {
    this.fetchSemanticTopicsOfArticle(title);
    this.showNextArticleBasedOnInterestOrRandom('like');
  }

  addTopicsToLikedTopics(topics: string | string[]): void {
    if (!topics) return;
    const raw = localStorage.getItem('likedTopics');
    const counts: Record<string, { count: number; weight: number }> = raw
      ? JSON.parse(raw)
      : {};
    const newTopics = Array.isArray(topics) ? topics : [topics];

    newTopics.forEach((topic) => {
      if (typeof topic === 'string' && topic.trim() !== '') {
        if (!counts[topic]) {
          counts[topic] = { count: 0, weight: 0 };
        }
        counts[topic].count += 1 + Math.log(1 + counts[topic].count);
      }
    });

    const totalLikes = Object.values(counts).reduce(
      (sum, entry) => sum + entry.count,
      0
    );

    Object.entries(counts).forEach(([topic, data]) => {
      data.weight = totalLikes > 0
        ? +(data.count / totalLikes * 100).toFixed(2)
        : 0;
    });

    localStorage.setItem('likedTopics', JSON.stringify(counts));
  }

  getRandomLikedTopicByWeight(): string | null {
    const raw = localStorage.getItem('likedTopics');
    if (!raw) return null;
    const counts: Record<string, { count: number; weight: number }> =
      JSON.parse(raw);
    const entries = Object.entries(counts);
    const totalWeight = entries.reduce(
      (sum, [, data]) => sum + data.weight,
      0
    );
    if (totalWeight === 0) return null;
    const r = Math.random() * totalWeight;
    let acc = 0;
    for (const [topic, data] of entries) {
      acc += data.weight;
      if (r <= acc) return topic;
    }
    return entries[entries.length - 1][0];
  }

  getTopicWeight(topicLabel: string): number | null {
    const raw = localStorage.getItem('likedTopics');
    if (!raw) return null;
    const counts = JSON.parse(raw);
    return counts[topicLabel]?.weight ?? null;
  }

  showNextArticleBasedOnInterestOrRandom(context: 'like' | 'dislike') {
    const interestRate = 0.7;
    const r = Math.random();
    if (r < interestRate) {
      const topic = this.getRandomLikedTopicByWeight();
      if (topic) {
        this.topicNotification = `Empfohlen aus deinen Interessen (${context}): ${topic}`;
        this.fetchArticlesForTopic(topic);
      } else {
        this.topicNotification = `Zufälliger Artikel (${context})`;
        this.fetchRandomArticle();
      }
    } else {
      this.topicNotification = `Zufälliger Artikel (${context})`;
      this.fetchRandomArticle();
    }
  }
}
