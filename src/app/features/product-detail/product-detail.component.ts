// ============================================================
// VOYÆ — Product Detail Page (backend-aligned)
// ============================================================
import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models';

@Component({
  selector: 'voy-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  @Input() id!: string; // bound from route via withComponentInputBinding()

  private productService = inject(ProductService);
  private cartService    = inject(CartService);

  product    = signal<Product | undefined>(undefined);
  addedToBag = signal(false);

  ngOnInit(): void {
    this.product.set(this.productService.getById(this.id));
  }

  addToBag(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addItem(p);
    this.addedToBag.set(true);
    setTimeout(() => this.addedToBag.set(false), 2000);
  }

  formatPrice(price: number, discount: number): string {
    if (discount > 0) {
      const final = price * (1 - discount / 100);
      return `$${final.toFixed(0)}`;
    }
    return `$${price}`;
  }
}