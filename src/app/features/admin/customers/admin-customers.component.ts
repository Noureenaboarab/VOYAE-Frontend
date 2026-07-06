// ============================================================
// VOYÆ — Admin Customers Page
// ============================================================
import { Component, inject, signal, computed } from '@angular/core';
import { AdminCustomerService } from '../../../core/services/admin-customer.service';
import { AdminCustomerTab } from '../../../core/models/admin.models';

@Component({
    selector: 'voy-admin-customers',
    standalone: true,
    imports: [],
    templateUrl: './admin-customers.component.html',
    styleUrl: './admin-customers.component.scss',
})
export class AdminCustomersComponent {
    private service = inject(AdminCustomerService);

    // ── Tab counts ───────────────────────────────────────────
    readonly totalCount    = this.service.totalCount;
    readonly activeCount   = this.service.activeCount;
    readonly inactiveCount = this.service.inactiveCount;

    // ── Local state ──────────────────────────────────────────
    readonly activeTab     = signal<AdminCustomerTab>('all');
    readonly searchQuery   = signal('');
    readonly currentPage   = signal(1);
    readonly selectedEmail = signal<string | null>(null); // null = list view
    readonly PAGE_SIZE     = 8;

    // ── Derived: list view ────────────────────────────────────
    readonly filteredCustomers = computed(() => {
        const tab = this.activeTab();
        const q   = this.searchQuery().toLowerCase().trim();

        let items = this.service.customers();

        if (tab !== 'all') {
            items = items.filter(c => c.status === tab);
        }

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
    // Profile + stats only — this simplified service doesn't carry
    // per-order line items, only the pre-aggregated totalOrders/
    // totalSpent already on each AdminCustomer.
    readonly selectedCustomer = computed(() => {
        const email = this.selectedEmail();
        if (!email) return null;
        return this.service.getByEmail(email) ?? null;
    });

    readonly selectedCustomerOrders = computed(() => {
        const email = this.selectedEmail();
        if (!email) return [];
        return this.service.getOrdersFor(email);
    });

    readonly selectedAvgOrderValue = computed(() => {
        const customer = this.selectedCustomer();
        if (!customer || customer.totalOrders === 0) return 0;
        return customer.totalSpent / customer.totalOrders;
    });

    // ── Tab / search / pagination ────────────────────────────
    setTab(tab: AdminCustomerTab): void {
        this.activeTab.set(tab);
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
    selectCustomer(email: string): void {
        this.selectedEmail.set(email);
    }

    backToList(): void {
        this.selectedEmail.set(null);
    }

    // ── Display helpers ────────────────────────────────────────
    formatDate(isoString: string): string {
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
}