// ============================================================
// VOYÆ — Cart Service (backend-integrated)
// ============================================================
// This service is a thin reactive wrapper around GET/POST/PUT/DELETE
// /api/cart/*. The backend is the source of truth for items, quantities,
// prices, and totals — nothing here recomputes subtotal/effectivePrice
// itself. Coupons/shipping have no backend equivalent yet (only "offers"
// do), so they stay purely client-side and are layered on top of the
// server-computed subtotal for display only.
import { Injectable, signal, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { CartResponse, CartItemResponse, Product } from '../models';
import { AuthService } from './auth.service';

const VALID_COUPONS: Record<string, number> = {
  'VOYAE10':   10,
  'WELCOME20': 20,
  'SUMMER15':  15,
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private http   = inject(HttpClient);
  private auth   = inject(AuthService);
  private router = inject(Router);

  /** Raw server cart. Null until the first load resolves. */
  readonly cart = signal<CartResponse | null>(null);

  /** Set when the last mutation failed, so components can surface it. */
  readonly error = signal<string | null>(null);

  readonly items      = computed<CartItemResponse[]>(() => this.cart()?.items ?? []);

  /** Total quantity across all line items (e.g. 2 of the same product + 1 of
   * another = 3), not the number of distinct line items. The backend's
   * CartResponse.itemCount counts distinct items, which isn't what a cart
   * badge should show, so this is derived client-side instead. */
  readonly itemCount = computed(() =>
      this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

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
    // Reacts to auth.token() changing — logging in reloads the cart,
    // logging out clears it. No manual refresh needed either way.
    // Uses subscribe() rather than effect() so writing to signals here
    // isn't subject to Angular's effect signal-write restriction (NG0600).
    toObservable(this.auth.token).subscribe((token) => {
      if (token) {
        this.loadCart();
      } else {
        this.cart.set(null);
        this._discount.set(0);
        this._couponCode.set('');
        this.error.set(null);
      }
    });
  }

  /** Fetch the current user's cart. Safe to call for a guest — it just
   * no-ops rather than firing a request that would 401. Call again after
   * login to populate the cart. */
  loadCart(): void {
    if (!this.auth.token()) return;
    this.http.get<CartResponse>('/api/cart').subscribe({
      next: (cart) => { this.cart.set(cart); this.error.set(null); },
      error: (err) => this.handleError(err),
    });
  }

  /** Guards mutating actions behind login. Redirects a guest to /login
   * (preserving the current URL to return to) instead of firing a request
   * that the backend would reject with 401. Returns false if blocked. */
  private requireAuth(): boolean {
    if (this.auth.token()) return true;
    this.error.set('Please log in to add items to your bag.');
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    return false;
  }

  private handleError(err: HttpErrorResponse): void {
    if (err.status === 401) {
      this.error.set('Your session has expired. Please log in again.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.error.set(this.messageFrom(err));
  }

  /** Accepts the full Product so existing call sites (product-detail,
   * offers, offer-strip, product-card) don't need to extract the id themselves. */
  addItem(product: Product, quantity = 1): void {
    if (!this.requireAuth()) return;
    const productId = Number(product.id);
    this.http.post<CartResponse>('/api/cart/items', { productId, quantity }).subscribe({
      next: (cart) => { this.cart.set(cart); this.error.set(null); },
      error: (err) => this.handleError(err),
    });
  }

  removeItem(itemId: number): void {
    if (!this.requireAuth()) return;
    this.http.delete<CartResponse>(`/api/cart/items/${itemId}`).subscribe({
      next: (cart) => { this.cart.set(cart); this.error.set(null); },
      error: (err) => this.handleError(err),
    });
  }

  /** Sets an item to an exact quantity. Removes the item if quantity <= 0. */
  updateQuantity(itemId: number, quantity: number): void {
    if (!this.requireAuth()) return;
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    this.http.put<CartResponse>(`/api/cart/items/${itemId}`, { quantity }).subscribe({
      next: (cart) => { this.cart.set(cart); this.error.set(null); },
      error: (err) => this.handleError(err),
    });
  }

  /** Returns an Observable so callers can subscribe and chain follow-up
   * logic (e.g. calling setDiscount for a bundle-savings label) on success. */
  applyOffer(offerId: number): Observable<CartResponse> {
    if (!this.requireAuth()) {
      return throwError(() => new Error('Not authenticated'));
    }
    return this.http.post<CartResponse>(`/api/cart/offers/${offerId}`, {}).pipe(
        tap((cart) => { this.cart.set(cart); this.error.set(null); }),
        catchError((err: HttpErrorResponse) => {
          this.handleError(err);
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