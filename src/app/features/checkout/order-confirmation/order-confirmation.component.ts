import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService, OrderConfirmResponse } from '../../../core/services/payment.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="confirm-page">
      @if (isLoading()) {
        <div class="confirm-loading">
          <div class="spinner"></div>
          <p>Loading your order…</p>
        </div>
      } @else if (order()) {
        <div class="confirm-content">
          <div class="confirm-icon" aria-hidden="true">✓</div>
          <h1>Order confirmed!</h1>
          <p class="confirm-sub">
            Your order <strong>#{{ order()!.order_id }}</strong> has been placed
            and payment received.
          </p>
          @if (order()!.estimated_delivery) {
            <p class="confirm-delivery">
              Estimated delivery: <strong>{{ order()!.estimated_delivery }}</strong>
            </p>
          }
          <a routerLink="/shop" class="btn-primary">Continue shopping</a>
        </div>
      } @else {
        <div class="confirm-content">
          <div class="confirm-icon payment-icon" aria-hidden="true">✓</div>
          <h1>Payment received!</h1>
          <p class="confirm-sub">
            Your payment was processed successfully. You'll receive a confirmation email shortly.
          </p>
          <a routerLink="/shop" class="btn-primary">Continue shopping</a>
        </div>
      }
    </section>
  `,
  styles: [`
    .confirm-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .confirm-content {
      text-align: center;
      max-width: 480px;
    }
    .confirm-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #1a1a1a;
      color: #fff;
      font-size: 1.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }
    h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.75rem; }
    .confirm-sub { color: #555; margin-bottom: 0.5rem; line-height: 1.6; }
    .confirm-delivery { color: #888; font-size: 0.9rem; margin-bottom: 2rem; }
    .btn-primary {
      display: inline-block;
      padding: 0.875rem 2rem;
      background: #1a1a1a;
      color: #fff;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-size: 0.85rem;
      border-radius: 6px;
      text-decoration: none;
      margin-top: 1.5rem;
    }
    .confirm-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #888;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e0e0e0;
      border-top-color: #1a1a1a;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentSvc = inject(PaymentService);

  readonly order     = signal<OrderConfirmResponse | null>(null);
  readonly isLoading = signal(true);

  async ngOnInit() {
    const orderId   = this.route.snapshot.queryParamMap.get('orderId');

    if (orderId) {
      try {
        const o = await firstValueFrom(this.paymentSvc.getOrder(orderId));
        this.order.set(o);
      } catch { /* show generic success */ }
    }

    this.isLoading.set(false);
  }
}
