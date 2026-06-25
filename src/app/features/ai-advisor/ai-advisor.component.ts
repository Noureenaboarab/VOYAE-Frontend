// ============================================================
// VOYÆ — AI Advisor (backend-aligned)
// ============================================================
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AiSearchService } from '../../core/services/ai-search.service';
import { ProductRecommendation } from '../../core/models';

@Component({
  selector: 'app-ai-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ai-advisor.component.html',
  styleUrl: './ai-advisor.component.scss',
})
export class AiAdvisorComponent {
  query       = signal('');
  summary     = signal('');
  products    = signal<ProductRecommendation[]>([]);
  loading     = signal(false);
  error       = signal('');
  hasSearched = signal(false);

  suggestions = [
    'Lightweight carry-on',
    'Weekend trip',
    'Long journey',
    'Best value',
  ];

  constructor(
    private aiSearchService: AiSearchService,
    private router: Router,
  ) {}

  setQuery(text: string): void {
    this.query.set(text);
  }

  getRecommendations(): void {
    if (!this.query().trim()) return;
    this.loading.set(true);
    this.error.set('');
    this.hasSearched.set(false);

    this.aiSearchService.search(this.query()).subscribe({
      next: (response) => {
        this.summary.set(response.summary);
        this.products.set(response.products);
        this.hasSearched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Something went wrong. Please try again.');
        this.loading.set(false);
      },
    });
  }

  goToProduct(id: number): void {
    this.router.navigate(['/product', String(id)]);
  }

  getDiscountedPrice(product: ProductRecommendation): number {
    if (!product.discount || product.discount === 0) return product.basePrice;
    return product.basePrice * (1 - product.discount / 100);
  }

  tryDifferentPrompt(): void {
    this.query.set('');
    this.hasSearched.set(false);
    this.products.set([]);
    this.summary.set('');
  }
}