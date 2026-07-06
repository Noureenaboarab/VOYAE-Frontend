// ============================================================
// VOYAE - Account Order Detail Page
// ============================================================
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'voy-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  @Input() id!: string;

  private accountService = inject(AccountService);

  order = signal<Order | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrder();
  }

  formatOrderId(order: Order): string {
    return `#${order.id}`;
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  }

  formatMoney(value: number): string {
    if (!Number.isFinite(value)) {
      return '$0.00';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      processing: 'Processing',
      shipped:    'Shipped',
      delivered:  'Delivered',
      returned:   'Returned',
    };
    return labels[status] ?? status;
  }

  getPaymentStatusLabel(status?: string): string {
    if (!status) return 'Unknown';

    const labels: Record<string, string> = {
      CAPTURED: 'Captured',
      PENDING:  'Pending',
      FAILED:   'Failed',
      REFUNDED: 'Refunded',
    };
    return labels[status] ?? status.replaceAll('_', ' ').toLowerCase();
  }

  getItemCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getItemsTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  trackOrderItem(_: number, item: Order['items'][number]): string {
    return String(item.id ?? item.productId);
  }

  private loadOrder(): void {
    this.loading.set(true);
    this.error.set(null);

    this.accountService.getOrder(this.id).subscribe({
      next: order => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: err => {
        console.error('Failed to load order', err);
        this.error.set('Could not load this order. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
