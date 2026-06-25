// ============================================================
// VOYÆ — Site Header
// ============================================================
import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'voy-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private cart = inject(CartService);
  readonly searchService = inject(SearchService);

  cartCount  = this.cart.itemCount;
  menuOpen   = signal(false);
  isScrolled = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 0;
  }

  openSearch(): void {
    this.searchService.open();
  }
}