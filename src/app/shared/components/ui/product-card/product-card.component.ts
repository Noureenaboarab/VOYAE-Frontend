// ============================================================
// VOYÆ — Product Card (backend-aligned)
// ============================================================
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../../../core/models';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'voy-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  @Input()  product!: Product;
  @Input()  wishlisted = false;
  @Output() wishlistToggle = new EventEmitter<Product>();

  private router = inject(Router);
  private cart   = inject(CartService);

  navigateToProduct(): void {
    this.router.navigate(['/product', this.product.id]);
  }

  onWishlistToggle(event: Event): void {
    event.stopPropagation();
    this.wishlistToggle.emit(this.product);
  }

  onAddToBag(event: Event): void {
    event.stopPropagation();
    this.cart.addItem(this.product);
  }

  get displayPrice(): string {
    if (this.product.discount > 0) {
      const final = this.product.price * (1 - this.product.discount / 100);
      return `$${final.toFixed(0)}`;
    }
    return `$${this.product.price}`;
  }
}