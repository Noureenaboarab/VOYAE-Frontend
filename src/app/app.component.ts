// ============================================================
// VOYÆ — Root App Component
// ============================================================
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
    <voy-announcement-bar />
    <voy-header />
    <router-outlet />
    <voy-footer />
    <voy-search-modal />
  `,
})
export class AppComponent {}