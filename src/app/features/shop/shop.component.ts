// ============================================================
// VOYÆ — Shop / Collection Page (backend-aligned)
// ============================================================
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/ui/product-card/product-card.component';

@Component({
  selector: 'voy-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent {
  private productService = inject(ProductService);

  products       = this.productService.filteredProducts;
  filter         = this.productService.filter;
  availableTypes = this.productService.availableTypes;
  loading        = this.productService.loading;
  error          = this.productService.error;

  wishlist = signal<Set<string>>(new Set());

  sortOptions = [
    { value: 'featured',   label: 'Featured' },
    { value: 'price-asc',  label: 'Price: Low–High' },
    { value: 'price-desc', label: 'Price: High–Low' },
    { value: 'newest',     label: 'Newest' },
  ];

  isTypeActive(type: string): boolean {
    return this.filter().types.includes(type);
  }

  isWishlisted(productId: string): boolean {
    return this.wishlist().has(productId);
  }

  toggleType(type: string): void {
    this.productService.toggleType(type);
  }

  onSortChange(value: string): void {
    this.productService.updateFilter({ sortBy: value as any });
  }

  onPriceChange(min: number, max: number): void {
    this.productService.updateFilter({ priceMin: min, priceMax: max });
  }

  onWishlistToggle(product: any): void {
    this.wishlist.update(set => {
      const next = new Set(set);
      next.has(product.id) ? next.delete(product.id) : next.add(product.id);
      return next;
    });
  }

  resetFilters(): void {
    this.productService.resetFilter();
  }
}