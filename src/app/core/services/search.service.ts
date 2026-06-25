// ============================================================
// VOYÆ — Search Service
// ============================================================
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
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
}