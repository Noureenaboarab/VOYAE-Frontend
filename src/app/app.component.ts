// ============================================================
// VOYÆ — Root App Component
// ============================================================
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnnouncementBarComponent } from './core/components/announcement-bar/announcement-bar.component';
import { HeaderComponent } from './core/components/header/header.component';
import { FooterComponent } from './core/components/footer/footer.component';

@Component({
  selector: 'voy-root',
  standalone: true,
  imports: [RouterOutlet, AnnouncementBarComponent, HeaderComponent, FooterComponent],
  template: `
    <voy-announcement-bar />
    <voy-header />
    <router-outlet />
    <voy-footer />
  `,
})
export class AppComponent {}
