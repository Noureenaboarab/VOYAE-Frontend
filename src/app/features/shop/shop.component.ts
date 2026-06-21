// ============================================================
// VOYÆ — Shop / Collection Page
// ============================================================
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/ui/product-card/product-card.component';
import { ProductSize, ProductColor } from '../../core/models';

interface ColorSwatch { id: ProductColor; label: string; hex: string; }

@Component({
  selector: 'voy-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent {
  private productService = inject(ProductService);

  products = this.productService.filteredProducts;
  filter   = this.productService.filter;

  wishlist = signal<Set<string>>(new Set());

  sortOptions = [
    { value: 'featured',   label: 'Featured' },
    { value: 'price-asc',  label: 'Price: Low–High' },
    { value: 'price-desc', label: 'Price: High–Low' },
    { value: 'newest',     label: 'Newest' },
  ];

  sizes: { id: ProductSize; label: string }[] = [
    { id: 'carry-on', label: 'Carry-On' },
    { id: 'check-in', label: 'Check-In' },
    { id: 'large',    label: 'Large' },
    { id: 'set',      label: 'Set' },
  ];

  colors: ColorSwatch[] = [
    { id: 'desert-sand',    label: 'Desert Sand',    hex: '#C4724E' },
    { id: 'obsidian-black', label: 'Obsidian Black', hex: '#1A1916' },
    { id: 'chalk-white',    label: 'Chalk White',    hex: '#F0EDE8' },
    { id: 'slate-grey',     label: 'Slate Grey',     hex: '#7A7A7A' },
    { id: 'navy-blue',      label: 'Navy Blue',      hex: '#1B2A4A' },
    { id: 'forest-green',   label: 'Forest Green',   hex: '#2D4A34' },
  ];

  isSizeActive(size: ProductSize): boolean {
    return this.filter().sizes.includes(size);
  }

  isColorActive(color: ProductColor): boolean {
    return this.filter().colors.includes(color);
  }

  isWishlisted(productId: string): boolean {
    return this.wishlist().has(productId);
  }

  toggleSize(size: ProductSize): void {
    this.productService.toggleSize(size);
  }

  toggleColor(color: ProductColor): void {
    this.productService.toggleColor(color);
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
