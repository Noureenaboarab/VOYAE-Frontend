// ============================================================
// VOYÆ — Search Service
// ============================================================
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private router = inject(Router);

  readonly isOpen = signal(false);
  readonly query  = signal('');

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  setQuery(value: string): void {
    this.query.set(value);
  }

  /** Navigate to the full search results page and close the modal. */
  submitSearch(term?: string): void {
    const q = (term ?? this.query()).trim();
    if (!q) return;
    this.close();
    this.router.navigate(['/search'], { queryParams: { q } });
  }
}