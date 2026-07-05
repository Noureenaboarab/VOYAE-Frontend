// ============================================================
// VOYÆ — Admin Orders Page
// ============================================================
import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { AdminOrderService } from '../../../core/services/admin-order.service';
import { AdminOrder, AdminOrderStatus, AdminOrderTab } from '../../../core/models/admin.models';

@Component({
  selector: 'voy-admin-orders',
  standalone: true,
  imports: [],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
})
export class AdminOrdersComponent {
  private service = inject(AdminOrderService);

  // ── Tab counts ───────────────────────────────────────────
  readonly totalCount      = this.service.totalCount;
  readonly processingCount = this.service.processingCount;
  readonly shippedCount    = this.service.shippedCount;
  readonly deliveredCount  = this.service.deliveredCount;
  readonly returnedCount   = this.service.returnedCount;

  // ── Local state ──────────────────────────────────────────
  readonly activeTab       = signal<AdminOrderTab>('all');
  readonly searchQuery     = signal('');
  readonly currentPage     = signal(1);
  readonly activeDropdown  = signal<string | null>(null);  // status dropdown
  readonly expandedOrderId = signal<string | null>(null);  // detail panel
  readonly PAGE_SIZE       = 8;

  // ── Derived ──────────────────────────────────────────────
  readonly filteredOrders = computed(() => {
    const tab = this.activeTab();
    const q   = this.searchQuery().toLowerCase().trim();

    let items = this.service.orders();

    if (tab !== 'all') {
      items = items.filter(o => o.status === tab);
    }

    if (q) {
      items = items.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q)
      );
    }

    return items;
  });

  readonly filteredCount = computed(() => this.filteredOrders().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCount() / this.PAGE_SIZE))
  );

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  readonly paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredOrders().slice(start, start + this.PAGE_SIZE);
  });

  readonly showingCount = computed(() => this.paginatedOrders().length);

  // ── Status options ───────────────────────────────────────
  readonly STATUS_OPTIONS: { value: AdminOrderStatus; label: string }[] = [
    { value: 'processing', label: 'Processing' },
    { value: 'shipped',    label: 'Shipped'    },
    { value: 'delivered',  label: 'Delivered'  },
    { value: 'returned',   label: 'Returned'   },
  ];

  // ── Tab / search / pagination ────────────────────────────
  setTab(tab: AdminOrderTab): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.activeDropdown.set(null);
    this.expandedOrderId.set(null);
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    this.expandedOrderId.set(null);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.activeDropdown.set(null);
    this.expandedOrderId.set(null);
  }

  // ── Status dropdown ──────────────────────────────────────
  toggleDropdown(orderId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeDropdown.update(current => current === orderId ? null : orderId);
  }

  changeStatus(orderId: string, status: AdminOrderStatus, event: MouseEvent): void {
    event.stopPropagation();
    this.service.updateStatus(orderId, status);
    this.activeDropdown.set(null);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.activeDropdown.set(null);
  }

  // ── Order detail panel ───────────────────────────────────
  toggleExpanded(orderId: string): void {
    this.expandedOrderId.update(current => current === orderId ? null : orderId);
    this.activeDropdown.set(null);
  }

  lineTotal(price: number, quantity: number): string {
    return '$' + (price * quantity).toLocaleString('en-US');
  }

  // ── Display helpers ──────────────────────────────────────
  formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  formatTotal(total: number): string {
    return '$' + total.toLocaleString('en-US');
  }

  getItemPreview(order: AdminOrder): string {
    if (order.items.length === 0) return '—';
    const first = `${order.items[0].name} · ${order.items[0].color}`;
    return order.items.length === 1 ? first : `${first} +${order.items.length - 1}`;
  }

  getStatusLabel(status: AdminOrderStatus): string {
    const map: Record<AdminOrderStatus, string> = {
      processing: 'Processing',
      shipped:    'Shipped',
      delivered:  'Delivered',
      returned:   'Returned',
    };
    return map[status];
  }
}