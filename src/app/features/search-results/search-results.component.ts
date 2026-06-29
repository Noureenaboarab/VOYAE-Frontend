// ============================================================
// VOYÆ — Search Results Page
// ============================================================
import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { SearchService } from '../../core/services/search.service';
import { ProductCardComponent } from '../../shared/components/ui/product-card/product-card.component';
import { Product } from '../../core/models';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest';

@Component({
  selector: 'voy-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private productService = inject(ProductService);
  private searchService  = inject(SearchService);

  /** The live query string from the URL ?q= param */
  queryTerm = signal('');
  sortBy    = signal<SortKey>('featured');
  wishlist  = signal<Set<string>>(new Set());

  private sub!: Subscription;

  sortOptions: { value: SortKey; label: string }[] = [
    { value: 'featured',   label: 'Featured' },
    { value: 'price-asc',  label: 'Price: Low–High' },
    { value: 'price-desc', label: 'Price: High–Low' },
    { value: 'newest',     label: 'Newest' },
  ];

  /** All products from the service (live signal — includes API data once loaded). */
  private allProducts = computed(() =>
    (this.productService as any)['_products']() as Product[]
  );

  /** Products filtered by the current search term. */
  private matchedProducts = computed(() => {
    const q = this.queryTerm().toLowerCase().trim();
    if (!q) return this.allProducts();
    return this.allProducts().filter(p =>
      p.name.toLowerCase().includes(q)          ||
      p.type.toLowerCase().includes(q)          ||
      (p.description ?? '').toLowerCase().includes(q)
    );
  });

  /** Final list after sorting. */
  results = computed(() => {
    const items = [...this.matchedProducts()];
    switch (this.sortBy()) {
      case 'price-asc':
        return items.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return items.sort((a, b) => b.price - a.price);
      case 'newest':
        return items.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default: // featured — bestsellers first
        return items.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }
  });

  loading = this.productService.loading;
  error   = this.productService.error;

  ngOnInit(): void {
    // React to ?q= changes (e.g. user navigates back/forward or edits URL)
    this.sub = this.route.queryParamMap.subscribe(params => {
      const q = params.get('q') ?? '';
      this.queryTerm.set(q);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSortChange(value: string): void {
    this.sortBy.set(value as SortKey);
  }

  isWishlisted(id: string): boolean {
    return this.wishlist().has(id);
  }

  onWishlistToggle(product: Product): void {
    this.wishlist.update(set => {
      const next = new Set(set);
      next.has(product.id) ? next.delete(product.id) : next.add(product.id);
      return next;
    });
  }

  /** Open the search modal pre-filled with the current query. */
  openSearch(): void {
    this.searchService.setQuery(this.queryTerm());
    this.searchService.open();
  }
}
