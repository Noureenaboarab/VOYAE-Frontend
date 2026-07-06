// ============================================================
// VOYÆ — Admin Customer Service
// ============================================================
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    UserSummaryResponse,
    UserProfileResponse,
    AdminCustomer,
    AdminCustomerDetail,
    AdminCustomerOrderSummary,
    AdminCustomerTab,
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminCustomerService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/admin`;

    private readonly _customers = signal<AdminCustomer[]>([]);
    private readonly _activeTab = signal<AdminCustomerTab>('all');
    private readonly _loading   = signal(false);
    private readonly _error     = signal<string | null>(null);

    readonly customers = this._customers.asReadonly();
    readonly activeTab = this._activeTab.asReadonly();
    readonly loading   = this._loading.asReadonly();
    readonly error     = this._error.asReadonly();

    readonly filteredCustomers = computed(() => {
        const tab = this._activeTab();
        const all = this._customers();
        return tab === 'all' ? all : all.filter(c => c.status === tab);
    });

    setTab(tab: AdminCustomerTab): void {
        this._activeTab.set(tab);
    }

    async loadCustomers(): Promise<void> {
        this._loading.set(true);
        this._error.set(null);
        try {
            const users = await firstValueFrom(
                this.http.get<UserSummaryResponse[]>(`${this.baseUrl}/users`)
            );

            const customers: AdminCustomer[] = users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                initials: this.getInitials(user.name),
                status: 'active', // UI-only placeholder — no active/inactive field on the backend
            }));

            this._customers.set(customers);
        } catch (err) {
            this._error.set(this.extractErrorMessage(err));
            throw err;
        } finally {
            this._loading.set(false);
        }
    }

    async loadCustomerDetail(id: number): Promise<AdminCustomerDetail> {
        try {
            const profile = await firstValueFrom(
                this.http.get<UserProfileResponse>(`${this.baseUrl}/users/${id}`)
            );

            const orders: AdminCustomerOrderSummary[] = profile.orders.map(order => ({
                orderNumber: `#${order.id}`,
                orderDate: order.createdAt,
                total: order.totalAmount,
                status: order.status,
            }));

            return {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                initials: this.getInitials(profile.name),
                status: 'active',
                job: profile.job,
                joinedDate: profile.createdAt,
                totalOrders: profile.orders.length,
                totalSpent: profile.orders.reduce((sum, o) => sum + o.totalAmount, 0),
                orders,
            };
        } catch (err) {
            this._error.set(this.extractErrorMessage(err));
            throw err;
        }
    }

    private extractErrorMessage(err: unknown): string {
        if (err instanceof HttpErrorResponse) {
            if (err.status === 401) return 'Your session has expired. Please log in again.';
            if (err.status === 403) return 'You do not have permission to view this data.';
            return err.error?.message ?? 'Something went wrong. Please try again.';
        }
        return 'Unexpected error occurred.';
    }

    private getInitials(name: string): string {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(part => part[0]?.toUpperCase() ?? '')
            .join('');
    }
}