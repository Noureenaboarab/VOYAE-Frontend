import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OfferService } from '../../core/services/offer.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models';

@Component({
  selector: 'voy-offers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss',
})
export class OffersComponent {
  private offerService = inject(OfferService);
  private cartService = inject(CartService);
  private router = inject(Router);

  offers = this.offerService.offers;
  loading = this.offerService.loading;
  error = this.offerService.error;
  isClaimed = (id: number) => this.offerService.isClaimed(id);

  claimingId = signal<number | null>(null);

  claim(offerId: number): void {
    if (this.claimingId() !== null) return;

    const offer = this.offerService.getById(offerId);
    if (!offer) return;

    this.claimingId.set(offerId);

    const individualTotal = offer.products.reduce(
      (sum, p) => sum + (p.basePrice - p.discount), 0,
    );

    offer.products.forEach(p => {
      const product: Product = {
        id: String(p.id),
        name: p.name,
        type: 'Bundle',
        price: p.basePrice - p.discount,
        discount: p.discount,
        imageUrl: p.imageUrl ?? '',
        inStock: true,
        createdAt: offer.createdAt,
      };
      this.cartService.addItem(product, 1);
    });

    const savings = individualTotal - offer.bundlePrice;
    if (savings > 0) {
      this.cartService.setDiscount(savings, offer.name);
    }

    this.offerService.markClaimed(offerId);

    this.cartService.applyOffer(offerId).subscribe({
      next: () => {
        this.claimingId.set(null);
        setTimeout(() => this.router.navigate(['/cart']), 800);
      },
      error: () => {
        this.claimingId.set(null);
      },
    });
  }

  percentSaved(offer: { savings: number; originalTotal: number }): number {
    return Math.round((offer.savings / offer.originalTotal) * 100);
  }
}
