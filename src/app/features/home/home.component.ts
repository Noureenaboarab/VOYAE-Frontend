// ============================================================
// VOYÆ — Home Page
// ============================================================
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/ui/product-card/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { Testimonial } from '../../core/models';

@Component({
  selector: 'voy-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private productService = inject(ProductService);

  featuredProducts = this.productService.filteredProducts;

  stats = [
    { value: '10yr',  label: 'Warranty on every shell' },
    { value: '40+',   label: 'Countries we ship to' },
    { value: '100',   label: 'Day trial, no questions' },
  ];

  features = [
    'Aircraft-grade aluminum frame',
    'Silent spinner wheels',
    'TSA-approved locks',
    'Polycarbonate shell',
    '10-year warranty',
    '100-day trial',
  ];

  testimonials: Testimonial[] = [
    {
      quote: 'Survived three international moves and looks brand new. The warranty is real — they replaced a wheel no questions asked.',
      author: 'Sofia N.',
      subtitle: 'Member since 2021',
    },
    {
      quote: "I've bought six suitcases in my life. This is the last one I'll ever need. The silence of those wheels alone is worth the price.",
      author: 'James K.',
      subtitle: 'Member since 2022',
    },
    {
      quote: 'Handles the brutal Tokyo–London route every month. Nothing scratches, nothing breaks, nothing catches.',
      author: 'Yuki T.',
      subtitle: 'Member since 2023',
    },
  ];
}
