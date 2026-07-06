// ============================================================
// VOYÆ — Admin Customers Page
// ============================================================
import { Component, inject, signal, computed } from '@angular/core';
import { AdminCustomerService } from '../../../core/services/admin-customer.service';
import { AdminCustomerTab, AdminCustomerDetail } from '../../../core/models/admin.models';

@Component({
    selector: 'voy-admin-customers',
    standalone: true,
    imports: [],
    templateUrl: './admin-customers.component.html',
    styleUrl: './admin-customers.component.scss',
})
export class AdminCustomersComponent {
    private service = inject(AdminCustomerService);

    // ── Local state ──────────────────────────────────────────
    readonly searchQuery = signal('');
    readonly currentPage = signal(1);
    readonly selectedId  = signal<number | null>(null); // null = list view
    readonly PAGE_SIZE   = 8;

    // Detail is fetched on demand — the service doesn't cache it,
    // it just returns a Promise per call, so it's held here.
    private readonly _selectedDetail = signal<AdminCustomerDetail | null>(null);
    private readonly _detailLoading  = signal(false);

    readonly selectedCustomer = this._selectedDetail.asReadonly();
    readonly detailLoading    = this._detailLoading.asReadonly();

    constructor() {
        this.service.loadCustomers();
    }

    // ── Tab state / counts ────────────────────────────────────
    readonly activeTab = this.service.activeTab;

    readonly totalCount = computed(() => this.service.customers().length);

    readonly activeCount = computed(() =>
        this.service.customers().filter(c => c.status === 'active').length
    );

    readonly inactiveCount = computed(() =>
        this.service.customers().filter(c => c.status === 'inactive').length
    );

    // ── Derived: list view ────────────────────────────────────
    readonly filteredCustomers = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        let items = this.service.filteredCustomers();

        if (q) {
            items = items.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q)
            );
        }

        return items;
    });

    readonly filteredCount = computed(() => this.filteredCustomers().length);

    readonly totalPages = computed(() =>
        Math.max(1, Math.ceil(this.filteredCount() / this.PAGE_SIZE))
    );

    readonly pages = computed(() =>
        Array.from({ length: this.totalPages() }, (_, i) => i + 1)
    );

    readonly paginatedCustomers = computed(() => {
        const start = (this.currentPage() - 1) * this.PAGE_SIZE;
        return this.filteredCustomers().slice(start, start + this.PAGE_SIZE);
    });

    readonly showingCount = computed(() => this.paginatedCustomers().length);

    // ── Derived: detail view ──────────────────────────────────
    readonly selectedCustomerOrders = computed(() =>
        this._selectedDetail()?.orders ?? []
    );

    readonly selectedAvgOrderValue = computed(() => {
        const customer = this._selectedDetail();
        if (!customer || customer.totalOrders === 0) return 0;
        return customer.totalSpent / customer.totalOrders;
    });

    // ── Tab / search / pagination ────────────────────────────
    setTab(tab: AdminCustomerTab): void {
        this.service.setTab(tab);
        this.currentPage.set(1);
    }

    onSearch(value: string): void {
        this.searchQuery.set(value);
        this.currentPage.set(1);
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages()) return;
        this.currentPage.set(page);
    }

    // ── List <-> detail navigation ────────────────────────────
    async selectCustomer(id: number): Promise<void> {
        this.selectedId.set(id);
        this._selectedDetail.set(null);
        this._detailLoading.set(true);
        try {
            const detail = await this.service.loadCustomerDetail(id);
            if (this.selectedId() === id) {
                this._selectedDetail.set(detail);
            }
        } finally {
            if (this.selectedId() === id) {
                this._detailLoading.set(false);
            }
        }
    }

    backToList(): void {
        this.selectedId.set(null);
        this._selectedDetail.set(null);
    }

    // ── Display helpers ────────────────────────────────────────
    formatDate(isoString: string): string {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    }

    formatCurrency(value: number): string {
        return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    getStatusLabel(status: string): string {
        return status === 'active' ? 'Active' : 'Inactive';
    }

    getOrderStatusLabel(status: string): string {
        const s = status.toUpperCase();
        return s.charAt(0) + s.slice(1).toLowerCase();
    }
}