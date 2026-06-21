// ============================================================
// VOYÆ — Product Detail Page
// ============================================================
import { Component, Input, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, ProductColor } from '../../core/models';

@Component({
  selector: 'voy-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  @Input() slug!: string; // bound from route via withComponentInputBinding()

  private productService = inject(ProductService);
  private cartService    = inject(CartService);

  product       = signal<Product | undefined>(undefined);
  selectedColor = signal<ProductColor | undefined>(undefined);
  addedToBag    = signal(false);
  activeImage   = signal(0);

  // Derived: label of currently selected colour — safe to use in template (no arrow fn)
  selectedColorLabel = computed(() => {
    const p = this.product();
    const c = this.selectedColor();
    if (!p || !c) return '';
    return p.colorOptions.find(opt => opt.id === c)?.label ?? '';
  });

  // Derived: whether selected colour matches a given swatch — used in template helper
  isColorSelected(colorId: ProductColor): boolean {
    return this.selectedColor() === colorId;
  }

  ngOnInit(): void {
    const p = this.productService.getBySlug(this.slug);
    this.product.set(p);
    if (p) this.selectedColor.set(p.color);
  }

  selectColor(color: ProductColor): void {
    this.selectedColor.set(color);
  }

  addToBag(): void {
    const p = this.product();
    const c = this.selectedColor();
    if (!p || !c) return;
    this.cartService.addItem(p, c);
    this.addedToBag.set(true);
    setTimeout(() => this.addedToBag.set(false), 2000);
  }

  formatPrice(price: number): string {
    return `$${price}`;
  }
}