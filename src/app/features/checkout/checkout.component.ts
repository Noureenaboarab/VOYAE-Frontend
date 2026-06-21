// ============================================================
// VOYÆ — Checkout Page
// ============================================================
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ShippingOption } from '../../core/models';

@Component({
  selector: 'voy-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private fb         = inject(FormBuilder);
  private cartSvc    = inject(CartService);
  private router     = inject(Router);

  // Cart state — all public so the template can access them
  cartItems    = this.cartSvc.items;
  subtotal     = this.cartSvc.subtotal;
  shipping     = this.cartSvc.shipping;
  total        = this.cartSvc.total;
  couponCode   = this.cartSvc.couponCode;
  cartDiscount = computed(() => this.cartSvc.cart().discount ?? 0);

  // UI state
  couponInput     = signal('');
  couponError     = signal('');
  couponApplied   = signal(false);
  placingOrder    = signal(false);

  shippingOptions: ShippingOption[] = [
    { id: 'standard', label: 'Standard — Free',  description: '5–7 business days', price: 'free' },
    { id: 'express',  label: 'Express — $18',    description: '2–3 business days', price: 18 },
  ];

  selectedShipping = signal<'standard' | 'express'>('standard');

  // Steps
  steps = [
    { num: 1, label: 'Contact' },
    { num: 2, label: 'Shipping' },
    { num: 3, label: 'Payment' },
  ];

  // Form
  form: FormGroup = this.fb.group({
    // Contact
    firstName: ['Sarah',                     Validators.required],
    lastName:  ['Mitchell',                  Validators.required],
    email:     ['sarah.mitchell@email.com',  [Validators.required, Validators.email]],
    phone:     ['+1 (555) 000-0000',         Validators.required],

    // Shipping address
    address: ['124 West 23rd Street, Apt 4B', Validators.required],
    city:    ['New York',                     Validators.required],
    zip:     ['10011',                        Validators.required],
    state:   ['New York',                     Validators.required],
    country: ['United States',                Validators.required],

    // Payment
    cardNumber: ['4242 4242 4242 4242', Validators.required],
    expiry:     ['08 / 27',            Validators.required],
    cvv:        ['',                   Validators.required],
  });

  applyCoupon(): void {
    const code = this.couponInput();
    const success = this.cartSvc.applyCoupon(code);
    if (success) {
      this.couponApplied.set(true);
      this.couponError.set('');
    } else {
      this.couponError.set('Invalid coupon code.');
      this.couponApplied.set(false);
    }
  }

  removeCoupon(): void {
    this.cartSvc.removeCoupon();
    this.couponApplied.set(false);
    this.couponInput.set('');
  }

  selectShipping(id: 'standard' | 'express'): void {
    this.selectedShipping.set(id);
  }

  async placeOrder(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.placingOrder.set(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    this.cartSvc.clear();
    this.router.navigate(['/order-confirmation']);
  }

  formatShippingPrice(price: number | 'free'): string {
    return price === 'free' ? 'Free' : `$${price}`;
  }

  formatPrice(n: number): string {
    return `$${n.toLocaleString()}`;
  }

  isFieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}