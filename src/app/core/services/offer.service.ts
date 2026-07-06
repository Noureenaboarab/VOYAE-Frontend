import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { Offer } from '../models';

const CLAIMED_KEY = 'voyae_claimed_offers';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private http = inject(HttpClient);

  readonly offers = signal<Offer[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly claimed = signal<Set<number>>(this.loadClaimed());
  readonly claimedIds = computed(() => this.claimed());

  constructor() {
    this.load().subscribe();
  }

  isClaimed(id: number): boolean {
    return this.claimed().has(id);
  }

  markClaimed(id: number): void {
    this.claimed.update(set => {
      const next = new Set(set);
      next.add(id);
      this.persistClaimed(next);
      return next;
    });
  }

  getById(id: number): Offer | undefined {
    return this.offers().find(o => o.id === id);
  }

  load(): Observable<Offer[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Offer[]>('/api/offers').pipe(
      tap(data => this.offers.set(data)),
      catchError(err => {
        console.error('Failed to load offers', err);
        this.error.set('Could not load offers.');
        return of([]);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  private loadClaimed(): Set<number> {
    try {
      const raw = localStorage.getItem(CLAIMED_KEY);
      return new Set<number>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  private persistClaimed(set: Set<number>): void {
    try {
      localStorage.setItem(CLAIMED_KEY, JSON.stringify([...set]));
    } catch { /* quota exceeded — silently ignore */ }
  }
}
