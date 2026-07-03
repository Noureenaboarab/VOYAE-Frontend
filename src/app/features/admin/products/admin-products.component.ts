// ============================================================
// VOYÆ — Admin Products Page
// ============================================================
import { Component, inject, signal, computed } from '@angular/core';
import { AdminProductService } from '../../../core/services/admin-product.service';
import { AdminProduct, AdminProductTab } from '../../../core/models/admin.models';
import { AddProductModalComponent } from './add-product-modal/add-product-modal.component';

@Component({
  selector: 'voy-admin-products',
  standalone: true,
  imports: [AddProductModalComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
})
export class AdminProductsComponent {
  constructor() { console.log('✅ AdminProductsComponent mounted'); }
  private service = inject(AdminProductService);

  // ── Service-derived counts (all products, unfiltered) ───
  readonly totalCount      = this.service.totalCount;
  readonly activeCount     = this.service.activeCount;
  readonly lowStockCount   = this.service.lowStockCount;
  readonly outOfStockCount = this.service.outOfStockCount;

  // ── Local filter / pagination state ─────────────────────
  readonly activeTab      = signal<AdminProductTab>('all');
  readonly searchQuery    = signal('');
  readonly categoryFilter = signal('');
  readonly statusFilter   = signal('');
  readonly currentPage    = signal(1);
  readonly PAGE_SIZE      = 8;

  // ── Modal state ─────────────────────────────────────────
  readonly showModal      = signal(false);
  readonly editingProduct = signal<AdminProduct | null>(null);

  // ── Derived: filtered list ───────────────────────────────
  readonly filteredProducts = computed(() => {
    const tab    = this.activeTab();
    const q      = this.searchQuery().toLowerCase().trim();
    const cat    = this.categoryFilter();
    const status = this.statusFilter();

    let items = this.service.products();

    // Tab filter
    if (tab !== 'all') {
      items = items.filter(p => p.status === tab);
    }

    // Full-text search: name, color, SKU
    if (q) {
      items = items.filter(p =>
        p.name.toLowerCase().includes(q)  ||
        p.color.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    // Category dropdown
    if (cat) {
      items = items.filter(p => p.type === cat);
    }

    // Status dropdown (stacks on top of tab filter)
    if (status) {
      items = items.filter(p => p.status === status);
    }

    return items;
  });

  readonly filteredCount = computed(() => this.filteredProducts().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCount() / this.PAGE_SIZE))
  );

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredProducts().slice(start, start + this.PAGE_SIZE);
  });

  readonly showingCount = computed(() => this.paginatedProducts().length);

  // ── Tab ──────────────────────────────────────────────────
  setTab(tab: AdminProductTab): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  // ── Filters ──────────────────────────────────────────────
  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onCategoryChange(value: string): void {
    this.categoryFilter.set(value);
    this.currentPage.set(1);
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  // ── Pagination ───────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  // ── Modal ────────────────────────────────────────────────
  openAddModal(): void {
    this.editingProduct.set(null);
    this.showModal.set(true);
  }

  openEditModal(product: AdminProduct): void {
    this.editingProduct.set(product);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }

  // ── Delete ───────────────────────────────────────────────
  deleteProduct(id: string): void {
    if (!confirm('Remove this product? This cannot be undone.')) return;
    this.service.deleteProduct(id);
  }

  // ── Display helpers ──────────────────────────────────────
  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'active':        'Active',
      'low-stock':     'Low Stock',
      'out-of-stock':  'Out of Stock',
    };
    return map[status] ?? status;
  }

  getBadgeLabel(badge: string | null): string {
    const map: Record<string, string> = {
      'bestseller': 'Bestseller',
      'new':        'New',
    };
    return badge ? (map[badge] ?? badge) : '—';
  }

  readonly categories = ['The Carry-On', 'The Check-In', 'The Large'];
}