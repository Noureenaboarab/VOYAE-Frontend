// ============================================================
// VOYÆ — Cart Service (backend-aligned)
// ============================================================
import { Injectable, signal, computed } from '@angular/core';
import { Cart, CartItem, Product } from '../models';

const VALID_COUPONS: Record<string, number> = {
  'VOYAE10':   10,
  'WELCOME20': 20,
  'SUMMER15':  15,
};

@Injectable({ providedIn: 'root' })
export class CartService {
  readonly cart = signal<Cart>({ items: [], discount: 0 });

  readonly items      = computed(() => this.cart().items);
  readonly couponCode = computed(() => this.cart().coupon ?? '');

  readonly subtotal = computed(() =>
    this.cart().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  );

  readonly shipping = computed<number | 'free'>(() => {
    const sub = this.subtotal();
    return sub >= 200 ? 'free' : 18;
  });

  readonly total = computed(() => {
    const sub      = this.subtotal();
    const discount = this.cart().discount ?? 0;
    const ship     = this.shipping();
    const shipCost = ship === 'free' ? 0 : ship;
    return Math.max(0, sub - discount + shipCost);
  });

  readonly itemCount = computed(() =>
    this.cart().items.reduce((sum, i) => sum + i.quantity, 0)
  );

  addItem(product: Product, quantity = 1): void {
    this.cart.update(cart => {
      const existing = cart.items.find(i => i.product.id === product.id);
      const items = existing
        ? cart.items.map(i =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        : [...cart.items, { product, quantity }];
      return { ...cart, items };
    });
  }

  removeItem(productId: string): void {
    this.cart.update(cart => ({
      ...cart,
      items: cart.items.filter(i => i.product.id !== productId),
    }));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.cart.update(cart => ({
      ...cart,
      items: cart.items.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }));
  }

  applyCoupon(code: string): boolean {
    const upper    = code.trim().toUpperCase();
    const discount = VALID_COUPONS[upper];
    if (discount !== undefined) {
      this.cart.update(cart => ({ ...cart, discount, coupon: upper }));
      return true;
    }
    return false;
  }

  removeCoupon(): void {
    this.cart.update(cart => ({ ...cart, discount: 0, coupon: undefined }));
  }

  clear(): void {
    this.cart.set({ items: [], discount: 0 });
  }
}