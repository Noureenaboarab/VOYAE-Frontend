import {
  Component, OnInit, OnDestroy, signal, computed,
  inject, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { PaymentService, ShippingAddress } from '../../core/services/payment.service';
import { CartService } from '../../core/services/cart.service';        // your existing service
import { environment } from '../../../environments/environment';

type CheckoutStep = 'shipping' | 'payment' | 'processing' | 'error';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly paymentSvc = inject(PaymentService);
  readonly cartSvc = inject(CartService);   // public — template reads subtotal/discount/total

  // ── Signals ──────────────────────────────────────────────────────────────
  readonly step = signal<CheckoutStep>('shipping');
  readonly errorMsg = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly cartItems = this.cartSvc.items;

  // Coupon — input value lives here; CartService owns the applied state
  couponInputValue = '';
  readonly couponError = signal<string | null>(null);

  readonly orderTotal = computed(() =>
    this.cartItems().reduce((sum, i) => sum + i.effectivePrice * i.quantity, 0)
  );

  // ── Forms ─────────────────────────────────────────────────────────────────
  shippingForm: FormGroup = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    address_line1: ['', Validators.required],
    address_line2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postal_code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\s\-]{3,10}$/i)]],
    country: ['US', Validators.required],
  });

  // ── Stripe internals ──────────────────────────────────────────────────────
  private clientSecret = '';
  private paymentIntentId = '';

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  async ngOnInit() {
    if (this.cartItems().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
  }

  ngOnDestroy() {
  }

  // ── Step 1: Shipping ──────────────────────────────────────────────────────
  async proceedToPayment() {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set(null);

    const formVal = this.shippingForm.value;
    const shippingAddress: ShippingAddress = {
      full_name: formVal.full_name,
      address_line1: formVal.address_line1,
      address_line2: formVal.address_line2 || undefined,
      city: formVal.city,
      state: formVal.state,
      postal_code: formVal.postal_code,
      country: formVal.country,
    };

    try {
      // Call backend → creates Stripe PaymentIntent, returns client_secret
      const resp = await firstValueFrom(
        this.paymentSvc.createPaymentIntent({
          items: this.cartItems().map(i => ({
            product_id: String(i.productId),
            name: i.productName,
            price: i.effectivePrice,
            quantity: i.quantity,
          })),
          currency: 'usd',
          shipping_address: shippingAddress,
          customer_email: formVal.email,
        })
      );

      this.clientSecret = resp.client_secret;
      this.paymentIntentId = resp.payment_intent_id;

      this.step.set('payment');

    } catch (err: any) {
      this.errorMsg.set(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async submitPayment() {
    this.step.set('processing');
    this.errorMsg.set(null);
    await this.finaliseOrder();
  }

  // ── Step 3: Notify backend to save the order ──────────────────────────────
  private async finaliseOrder() {
    const formVal = this.shippingForm.value;
    try {
      const order = await firstValueFrom(
        this.paymentSvc.confirmOrder({
          payment_intent_id: this.paymentIntentId,
          items: this.cartItems().map(i => ({
            product_id: String(i.productId),
            name: i.productName,
            price: i.effectivePrice,
            quantity: i.quantity,
          })),
          shipping_address: {
            full_name: formVal.full_name,
            address_line1: formVal.address_line1,
            address_line2: formVal.address_line2 || undefined,
            city: formVal.city,
            state: formVal.state,
            postal_code: formVal.postal_code,
            country: formVal.country,
          },
          customer_email: formVal.email,
        })
      );

      this.cartSvc.clear();   // resets coupon state and resyncs with server
      this.router.navigate(['/order-confirmation'], {
        queryParams: { orderId: order.order_id },
      });

    } catch (err: any) {
      // Payment succeeded but order save failed — log for manual recovery.
      // Still navigate to confirmation so customer isn't confused.
      console.error('Order save error (payment already captured):', err);
      this.router.navigate(['/order-confirmation'], {
        queryParams: { paymentId: this.paymentIntentId },
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  applyCoupon() {
    const code = this.couponInputValue.trim();
    if (!code) return;
    const applied = this.cartSvc.applyCoupon(code);
    if (!applied) {
      this.couponError.set('Invalid or expired discount code.');
    } else {
      this.couponError.set(null);
    }
  }

  goBackToShipping() {
    this.step.set('shipping');
  }

  fieldError(name: string): string | null {
    const ctrl: AbstractControl | null = this.shippingForm.get(name);
    if (!ctrl || !ctrl.touched || ctrl.valid) return null;
    if (ctrl.errors?.['required']) return 'This field is required.';
    if (ctrl.errors?.['email']) return 'Enter a valid email address.';
    if (ctrl.errors?.['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors?.['pattern']) return 'Invalid format.';
    return 'Invalid value.';
  }
}