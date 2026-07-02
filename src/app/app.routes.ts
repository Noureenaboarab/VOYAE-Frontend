// ============================================================
// VOYÆ — App Routes (updated: admin routes added)
// ============================================================
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'VOYAE – Luggage, Engineered',
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./features/shop/shop.component').then(m => m.ShopComponent),
    title: 'The Collection – VOYAE',
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search-results/search-results.component').then(
        m => m.SearchResultsComponent
      ),
    title: 'Search – VOYAE',
  },
  {
    path: 'collections',
    redirectTo: 'shop',
    pathMatch: 'full',
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/product-detail/product-detail.component').then(
        m => m.ProductDetailComponent
      ),
    title: 'Product – VOYAE',
  },
  {
    path: 'ai-advisor',
    loadComponent: () =>
      import('./features/ai-advisor/ai-advisor.component').then(
        m => m.AiAdvisorComponent
      ),
    title: 'AI Advisor – VOYAE',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Sign In – VOYAE',
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup.component').then(m => m.SignupComponent),
    canActivate: [guestGuard],
    title: 'Create Account – VOYAE',
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard],
    title: 'Checkout – VOYAE',
  },
  {
    path: 'order-confirmation',
    loadComponent: () =>
      import('./features/checkout/order-confirmation/order-confirmation.component').then(
        m => m.OrderConfirmationComponent
      ),
    canActivate: [authGuard],
    title: 'Order Confirmed – VOYAE',
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./features/account/account.component').then(m => m.AccountComponent),
    canActivate: [authGuard],
    title: 'My Account – VOYAE',
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then(m => m.CartComponent),
    title: 'Bag – VOYAE',
  },

  // ── Admin ────────────────────────────────────────────────
  // Add canActivate: [adminGuard] here once you build the guard
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(
        m => m.AdminLayoutComponent
      ),
    title: 'Admin – VOYAE',
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/admin-products.component').then(
            m => m.AdminProductsComponent
          ),
        title: 'Products – VOYAE Admin',
      },
      // Placeholder routes — swap loadComponent as pages are built
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: 'Orders – VOYAE Admin',
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: 'Customers – VOYAE Admin',
      },
      {
        path: 'discounts',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: 'Discounts – VOYAE Admin',
      },
    ],
  },

  // ── 404 ──────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found – VOYAE',
  },
];