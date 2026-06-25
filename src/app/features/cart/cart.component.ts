// ============================================================
// VOYÆ — Cart / Bag Page
// ============================================================
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/models';

@Component({
  selector: 'voy-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private cartService = inject(CartService);

  items    = this.cartService.items;
  subtotal = this.cartService.subtotal;
  shipping = this.cartService.shipping;
  total    = this.cartService.total;
  itemCount = this.cartService.itemCount;

  remove(item: CartItem): void {
    this.cartService.removeItem(item.product.id);
  }

  updateQty(item: CartItem, qty: number): void {
    this.cartService.updateQuantity(item.product.id, qty);
  }

  formatPrice(n: number): string {
    return `$${n.toLocaleString()}`;
  }

  formatShipping(s: number | 'free'): string {
    return s === 'free' ? 'Free' : `$${s}`;
  }
}