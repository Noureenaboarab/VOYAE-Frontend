import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CartItem } from '../models/cart.model';

export interface CreatePaymentIntentRequest {
  items: CartItem[];
  currency?: string;
  shipping_address?: ShippingAddress;
  customer_email?: string;
}

export interface CreatePaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
}

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderConfirmRequest {
  payment_intent_id: string;
  items: CartItem[];
  shipping_address: ShippingAddress;
  customer_email: string;
}

export interface OrderConfirmResponse {
  order_id: string;
  status: string;
  estimated_delivery?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiUrl;

  /**
   * Step 1: Create a PaymentIntent on your backend.
   * Backend receives cart items, creates a Stripe PaymentIntent,
   * and returns the client_secret to the frontend.
   *
   * POST /api/payments/create-intent
   */
  createPaymentIntent(payload: CreatePaymentIntentRequest): Observable<CreatePaymentIntentResponse> {
    return this.http.post<CreatePaymentIntentResponse>(
      `${this.apiBase}/payments/create-intent`,
      payload
    ).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to initialise payment')))
    );
  }

  /**
   * Step 2 (optional but recommended): Confirm the order on your backend
   * after Stripe payment succeeds. Your backend should verify the
   * PaymentIntent status with Stripe before saving the order.
   *
   * POST /api/orders/confirm
   */
  confirmOrder(payload: OrderConfirmRequest): Observable<OrderConfirmResponse> {
    return this.http.post<OrderConfirmResponse>(
      `${this.apiBase}/orders/confirm`,
      payload
    ).pipe(
      catchError(err => throwError(() => new Error(err?.error?.message ?? 'Failed to confirm order')))
    );
  }

  /**
   * Fetch an existing order by ID (used on /order-confirmation page).
   *
   * GET /api/orders/:orderId
   */
  getOrder(orderId: string): Observable<OrderConfirmResponse> {
    return this.http.get<OrderConfirmResponse>(
      `${this.apiBase}/checkout/orders/${orderId}`
    );
  }
}
