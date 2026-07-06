// ============================================================
// VOYÆ — Cart / Bag Page (backend-integrated)
// ============================================================
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OfferStripComponent } from '../../shared/components/ui/offer-strip/offer-strip.component';
import { CartItemResponse } from '../../core/models';

@Component({
  selector: 'voy-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, OfferStripComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private cartService = inject(CartService);

  items      = this.cartService.items;
  subtotal   = this.cartService.subtotal;
  shipping   = this.cartService.shipping;
  discount   = this.cartService.discount;
  couponCode = this.cartService.couponCode;
  total      = this.cartService.total;
  itemCount  = this.cartService.itemCount;
  error      = this.cartService.error;

  remove(item: CartItemResponse): void {
    this.cartService.removeItem(item.id);
  }

  updateQty(item: CartItemResponse, qty: number): void {
    this.cartService.updateQuantity(item.id, qty);
  }

  formatPrice(n: number): string {
    return `$${n.toLocaleString()}`;
  }

  formatShipping(s: number | 'free'): string {
    return s === 'free' ? 'Free' : `$${s}`;
  }
}