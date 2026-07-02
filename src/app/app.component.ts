// ============================================================
// VOYÆ — Root App Component (updated: hides storefront chrome on /admin/*)
// ============================================================
import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AnnouncementBarComponent } from './core/components/announcement-bar/announcement-bar.component';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { SearchModalComponent } from './shared/components/ui/search-modal/search-modal.component';

@Component({
  selector: 'voy-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AnnouncementBarComponent,
    HeaderComponent,
    FooterComponent,
    SearchModalComponent,
  ],
  template: `
    @if (!isAdmin()) {
      <div class="site-top">
        <voy-announcement-bar />
        <voy-header />
      </div>
    }
    <router-outlet />
    @if (!isAdmin()) {
      <voy-footer />
      <voy-search-modal />
    }
  `,
})
export class AppComponent {
  private router = inject(Router);

  /**
   * Reactively true whenever the active URL starts with /admin.
   * Suppresses the storefront announcement bar, header, footer,
   * and search modal — the admin layout provides its own chrome.
   * initialValue seeds the signal on first load so a hard-navigate
   * to /admin/products works without waiting for NavigationEnd.
   */
  readonly isAdmin = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects.startsWith('/admin')),
    ),
    { initialValue: this.router.url.startsWith('/admin') },
  );
}