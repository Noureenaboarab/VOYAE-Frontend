// ============================================================
// VOYÆ — App Routes
// ============================================================
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'VOYÆ — Luggage, Engineered',
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./features/shop/shop.component').then(m => m.ShopComponent),
    title: 'The Collection — VOYÆ',
  },
  {
    path: 'collections',
    redirectTo: 'shop',
    pathMatch: 'full',
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./features/product-detail/product-detail.component').then(
        m => m.ProductDetailComponent
      ),
    title: 'Product — VOYÆ',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout — VOYÆ',
  },
  {
    path: 'order-confirmation',
    loadComponent: () =>
      import('./features/checkout/order-confirmation/order-confirmation.component').then(
        m => m.OrderConfirmationComponent
      ),
    title: 'Order Confirmed — VOYÆ',
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./features/account/account.component').then(m => m.AccountComponent),
    title: 'My Account — VOYÆ',
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then(m => m.CartComponent),
    title: 'Bag — VOYÆ',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found — VOYÆ',
  },
];
