// ============================================================
// VOYÆ — Search Modal (backend-aligned)
// ============================================================
import {
  Component,
  inject,
  computed,
  effect,
  ElementRef,
  ViewChild,
  HostListener,
  OnDestroy,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { SearchService } from '../../../../core/services/search.service';
import { Product } from '../../../../core/models';

// Max inline results shown inside the modal before nudging to full results page
const MODAL_MAX_RESULTS = 6;

@Component({
  selector: 'voy-search-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.scss',
})
export class SearchModalComponent implements OnDestroy {
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  private router         = inject(Router);
  private productService = inject(ProductService);
  private destroyRef     = inject(DestroyRef);
  readonly searchService = inject(SearchService);

  isOpen = this.searchService.isOpen;
  query  = this.searchService.query;

  suggestions = computed<string[]>(() => {
    const q = this.query().toLowerCase().trim();
    const base = [
      'Carry-on luggage',
      'Hard shell suitcase',
      'Checked baggage',
      'Luggage sets',
      'Travel accessories',
    ];
    if (!q) return base;
    return base.filter(s => s.toLowerCase().includes(q));
  });

  popularTags = ['Carry-On', 'Check-In', 'Large', 'New arrivals'];

  results = computed<Product[]>(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    const all = (this.productService as any)['_products']() as Product[];
    return all.filter(p =>
      p.name.toLowerCase().includes(q)           ||
      p.type.toLowerCase().includes(q)           ||
      (p.description ?? '').toLowerCase().includes(q)
    );
  });

  /** Slice shown inside the modal; remaining count nudges to full page. */
  previewResults = computed(() => this.results().slice(0, MODAL_MAX_RESULTS));
  extraCount     = computed(() => Math.max(0, this.results().length - MODAL_MAX_RESULTS));

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => this.searchInputRef?.nativeElement.focus(), 50);
      }
    });

    effect(() => {
      document.body.style.overflow = this.isOpen() ? 'hidden' : '';
    });

    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.close();
  }

  close(): void {
    this.searchService.close();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  onQueryChange(value: string): void {
    this.searchService.setQuery(value);
  }

  setQuery(value: string): void {
    this.searchService.setQuery(value);
    this.searchInputRef?.nativeElement.focus();
  }

  clearQuery(): void {
    this.searchService.setQuery('');
    this.searchInputRef?.nativeElement.focus();
  }

  navigateToProduct(product: Product): void {
    this.close();
    this.router.navigate(['/product', product.id]);
  }

  /** Called on Enter key in the input or clicking "See all results". */
  submitSearch(): void {
    this.searchService.submitSearch();
  }

  seeAllResults(): void {
    this.searchService.submitSearch();
  }
}