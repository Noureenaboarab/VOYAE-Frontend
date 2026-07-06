import { Component, inject, signal, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OfferService } from '../../../../core/services/offer.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'voy-offer-strip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-strip.component.html',
  styleUrl: './offer-strip.component.scss',
})
export class OfferStripComponent implements AfterViewInit {
  private offerService = inject(OfferService);
  private cartService = inject(CartService);
  private router = inject(Router);

  readonly sentinel = viewChild.required<ElementRef<HTMLElement>>('sentinel');

  offers = this.offerService.offers;
  loading = this.offerService.loading;
  isClaimed = (id: number) => this.offerService.isClaimed(id);

  visible = signal(false);
  claimingId = signal<number | null>(null);

  ngAfterViewInit(): void {
    const el = this.sentinel().nativeElement;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.visible.set(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' },
    );

    observer.observe(el);

    setTimeout(() => {
      if (!this.visible()) {
        this.visible.set(true);
        observer.disconnect();
      }
    }, 3000);
  }

  claim(offerId: number): void {
    if (this.claimingId() !== null) return;

    const offer = this.offerService.getById(offerId);
    if (!offer) return;

    this.claimingId.set(offerId);

    this.cartService.applyOffer(offerId).subscribe({
      next: () => {
        this.offerService.markClaimed(offerId);
        this.claimingId.set(null);
        setTimeout(() => this.router.navigate(['/cart']), 800);
      },
      error: () => {
        this.claimingId.set(null);
      },
    });
  }
}
