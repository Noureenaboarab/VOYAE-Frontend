// ============================================================
// VOYÆ — Admin Order Service
// ============================================================
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminOrder, AdminOrderItem, AdminOrderStatus } from '../models/admin.models';

// ── Actual backend response shape (from AdminOrderResponse.java) ──
interface ProductResponse {
  id: number;
  name: string;
  color?: string;   // ⚠️ confirm this field exists on ProductResponse — guessing
  [key: string]: unknown;
}

interface OrderItemResponse {
  id: number;
  product: ProductResponse;
  quantity: number;
  priceAtPurchase: number;
}

interface CustomerSummary {
  id: number;
  name: string;
  email: string;
}

interface OrderResponse {
  id: number;
  customer: CustomerSummary;
  totalAmount: number;
  status: string;          // e.g. "PROCESSING" — Java enum name, uppercase
  items: OrderItemResponse[];
  paymentStatus: string;
  createdAt: string;       // LocalDateTime serializes as ISO string
}

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/orders`;

  private readonly _orders  = signal<AdminOrder[]>([]);
  private readonly _loading = signal(false);
  private readonly _error   = signal<string | null>(null);

  readonly orders  = this._orders.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error   = this._error.asReadonly();

  readonly totalCount      = computed(() => this._orders().length);
  readonly processingCount = computed(() => this._orders().filter(o => o.status === 'processing').length);
  readonly shippedCount    = computed(() => this._orders().filter(o => o.status === 'shipped').length);
  readonly deliveredCount  = computed(() => this._orders().filter(o => o.status === 'delivered').length);
  readonly returnedCount   = computed(() => this._orders().filter(o => o.status === 'returned').length);

  async loadOrders(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const response = await firstValueFrom(
          this.http.get<OrderResponse[]>(this.baseUrl)
      );

      const orders: AdminOrder[] = response.map(o => this.mapToAdminOrder(o));
      this._orders.set(orders);
    } catch (err) {
      this._error.set('Failed to load orders. Please try again.');
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  async updateStatus(id: string, status: AdminOrderStatus): Promise<void> {
    const previous = this._orders();
    this._orders.update(os => os.map(o => o.id === id ? { ...o, status } : o));

    try {
      const numericId = this.stripHash(id);
      // ⚠️ Backend enum is uppercase — confirm OrderStatusUpdateRequest's field name too
      await firstValueFrom(
          this.http.patch(`${this.baseUrl}/${numericId}/status`, {
            status: status.toUpperCase(),
          })
      );
    } catch (err) {
      this._orders.set(previous);
      this._error.set('Failed to update order status.');
      throw err;
    }
  }

  private mapToAdminOrder(o: OrderResponse): AdminOrder {
    const items: AdminOrderItem[] = o.items.map(i => ({
      productId: String(i.product.id),
      name: i.product.name,
      color: i.product.color ?? '—', // ⚠️ placeholder if ProductResponse has no color field
      quantity: i.quantity,
      price: i.priceAtPurchase,
    }));

    return {
      id: `#VOY-${o.id}`,
      date: o.createdAt,
      customer: {
        name: o.customer.name,
        email: o.customer.email,
        initials: this.getInitials(o.customer.name),
      },
      items,
      total: o.totalAmount,
      status: o.status.toLowerCase() as AdminOrderStatus,
    };
  }

  private getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('');
  }

  private stripHash(id: string): string {
    return id.replace(/^#/, '').replace(/^VOY-/, '');
  }
}