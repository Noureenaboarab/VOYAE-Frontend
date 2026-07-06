// ============================================================
// VOYÆ — Cart Service (backend-integrated)
// ============================================================
// This service is a thin reactive wrapper around GET/POST/PATCH/DELETE
// /api/cart/*. The backend is the source of truth for items, quantities,
// prices, and totals — nothing here recomputes subtotal/effectivePrice
// itself. Coupons/shipping have no backend equivalent yet (only "offers"
// do), so they stay purely client-side and are layered on top of the
// server-computed subtotal for display only.
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { CartResponse, CartItemResponse, Product } from '../models';

const VALID_COUPONS: Record<string, number> = {
  'VOYAE10':   10,
  'WELCOME20': 20,
  'SUMMER15':  15,
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);

  /** Raw server cart. Null until the first load resolves. */
  readonly cart = signal<CartResponse | null>(null);

  /** Set when the last mutation failed, so components can surface it. */
  readonly error = signal<string | null>(null);

  readonly items      = computed<CartItemResponse[]>(() => this.cart()?.items ?? []);
  readonly itemCount  = computed(() => this.cart()?.itemCount ?? 0);

  /** Server-computed subtotal (sum of each item's effectivePrice * quantity). */
  readonly subtotal = computed(() => this.cart()?.subtotal ?? 0);

  // --- Client-only coupon/shipping layer (display only, not persisted) ---
  private readonly _discount   = signal(0);
  private readonly _couponCode = signal('');

  readonly discount   = computed(() => this._discount());
  readonly couponCode = computed(() => this._couponCode());

  readonly shipping = computed<number | 'free'>(() => {
    const sub = this.subtotal();
    return sub >= 200 ? 'free' : 18;
  });

  readonly total = computed(() => {
    const sub      = this.subtotal();
    const discount = this._discount();
    const ship     = this.shipping();
    const shipCost = ship === 'free' ? 0 : ship;
    return Math.max(0, sub - discount + shipCost);
  });

  constructor() {
    this.loadCart();
  }

  /** Fetch the current user's cart. Called on init; call again to refresh. */
  loadCart(): void {
    this.http.get<CartResponse>('/api/cart').subscribe({
      next: (cart) => { this.cart.set(cart); this.error.set(null); },
      error: (err) => this.error.set(this.messageFrom(err)),
    });
  }

  /** Accepts the full Product so existing call sites (product-detail,
   * offers, offer-strip, product-card) don't need to extract the id themselves. */
  addItem(product: Product, quantity = 1): void {
    const productId = Number(product.id);
    this.http.post<CartResponse>('/api/cart/items', { productId, quantity }).subscribe({
      next: (cart) => { this.cart.set(cart); this.error.set(null); },
      error: (err) => this.error.set(this.messageFrom(err)),
    });
  }

  removeItem(itemId: number): void {
    this.http.delete<CartResponse>(`/api/cart/items/${itemId}`).subscribe({
      next: (cart) => { this.cart.set(cart); this.error.set(null); },
      error: (err) => this.error.set(this.messageFrom(err)),
    });
  }

  /** Sets an item to an exact quantity. Removes the item if quantity <= 0. */
  updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    this.http.patch<CartResponse>(`/api/cart/items/${itemId}`, { quantity }).subscribe({
      next: (cart) => { this.cart.set(cart); this.error.set(null); },
      error: (err) => this.error.set(this.messageFrom(err)),
    });
  }

  /** Returns an Observable so callers can subscribe and chain follow-up
   * logic (e.g. calling setDiscount for a bundle-savings label) on success. */
  applyOffer(offerId: number): Observable<CartResponse> {
    return this.http.post<CartResponse>(`/api/cart/offers/${offerId}`, {}).pipe(
        tap((cart) => { this.cart.set(cart); this.error.set(null); }),
        catchError((err: HttpErrorResponse) => {
          this.error.set(this.messageFrom(err));
          return throwError(() => err);
        }),
    );
  }

  // --- Coupon/shipping: client-side only, no backend endpoint exists yet ---
  applyCoupon(code: string): boolean {
    const upper    = code.trim().toUpperCase();
    const discount = VALID_COUPONS[upper];
    if (discount !== undefined) {
      this._discount.set(discount);
      this._couponCode.set(upper);
      return true;
    }
    return false;
  }

  removeCoupon(): void {
    this._discount.set(0);
    this._couponCode.set('');
  }

  /** Client-side-only display of bundle savings after an offer is applied. */
  setDiscount(amount: number, label?: string): void {
    this._discount.set(amount);
    this._couponCode.set(label ?? '');
  }

  /**
   * Call after a successful checkout. The backend clears the cart's items
   * server-side as part of order placement (per SRS 3.4), so this just
   * resets local coupon state and re-syncs with the server.
   */
  clear(): void {
    this._discount.set(0);
    this._couponCode.set('');
    this.loadCart();
  }

  private messageFrom(err: HttpErrorResponse): string {
    return err?.error?.error ?? 'Something went wrong updating your cart.';
  }
}