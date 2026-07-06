// ============================================================
//Admin Customer Service
// Mock data (20 customers) — swap signal initializer for HTTP
// call when a real /api/admin/users endpoint is ready.
// ============================================================
import { Injectable, signal, computed, inject } from '@angular/core';
import { AdminCustomer } from '../models/admin.models';
import { AdminOrderService } from './admin-order.service';

// ── Mock data ────────────────────────────────────────────────
const MOCK_CUSTOMERS: AdminCustomer[] = [
    { email: 'sophie.l@example.com',   name: 'Sophie Laurent',   initials: 'SL', joinedDate: '2024-03-02T10:00:00Z', totalOrders: 3,  totalSpent: 1085, status: 'active' },
    { email: 'marc.d@example.com',     name: 'Marc Dupont',      initials: 'MD', joinedDate: '2024-02-18T10:00:00Z', totalOrders: 1,  totalSpent: 295,  status: 'active' },
    { email: 'alex.c@example.com',     name: 'Alex Chen',        initials: 'AC', joinedDate: '2024-01-25T10:00:00Z', totalOrders: 2,  totalSpent: 740,  status: 'active' },
    { email: 'emma.w@example.com',     name: 'Emma Wilson',      initials: 'EW', joinedDate: '2024-04-10T10:00:00Z', totalOrders: 1,  totalSpent: 395,  status: 'active' },
    { email: 'james.r@example.com',    name: 'James Rodriguez',  initials: 'JR', joinedDate: '2024-01-08T10:00:00Z', totalOrders: 2,  totalSpent: 590,  status: 'active' },
    { email: 'i.moreau@example.com',   name: 'Isabelle Moreau',  initials: 'IM', joinedDate: '2024-03-19T10:00:00Z', totalOrders: 1,  totalSpent: 445,  status: 'active' },
    { email: 'lucas.m@example.com',    name: 'Lucas Martin',     initials: 'LM', joinedDate: '2024-02-27T10:00:00Z', totalOrders: 2,  totalSpent: 690,  status: 'active' },
    { email: 'c.brown@example.com',    name: 'Charlotte Brown',  initials: 'CB', joinedDate: '2024-05-01T10:00:00Z', totalOrders: 1,  totalSpent: 445,  status: 'active' },
    { email: 'n.thompson@example.com', name: 'Noah Thompson',    initials: 'NT', joinedDate: '2023-11-14T10:00:00Z', totalOrders: 4,  totalSpent: 1520, status: 'active' },
    { email: 'olivia.p@example.com',   name: 'Olivia Park',      initials: 'OP', joinedDate: '2023-12-20T10:00:00Z', totalOrders: 2,  totalSpent: 790,  status: 'active' },
    { email: 'ethan.d@example.com',    name: 'Ethan Davis',      initials: 'ED', joinedDate: '2024-01-30T10:00:00Z', totalOrders: 1,  totalSpent: 295,  status: 'active' },
    { email: 'ava.t@example.com',      name: 'Ava Taylor',       initials: 'AT', joinedDate: '2023-10-05T10:00:00Z', totalOrders: 3,  totalSpent: 1230, status: 'inactive' },
    { email: 'jackson.l@example.com',  name: 'Jackson Lewis',    initials: 'JL', joinedDate: '2023-09-11T10:00:00Z', totalOrders: 2,  totalSpent: 810,  status: 'inactive' },
    { email: 'luna.w@example.com',     name: 'Luna Walker',      initials: 'LW', joinedDate: '2023-08-22T10:00:00Z', totalOrders: 1,  totalSpent: 395,  status: 'inactive' },
    { email: 'grace.k@example.com',    name: 'Grace Kim',        initials: 'GK', joinedDate: '2024-06-15T10:00:00Z', totalOrders: 0,  totalSpent: 0,    status: 'active' },
    { email: 'daniel.f@example.com',   name: 'Daniel Foster',    initials: 'DF', joinedDate: '2024-06-20T10:00:00Z', totalOrders: 0,  totalSpent: 0,    status: 'active' },
    { email: 'priya.n@example.com',    name: 'Priya Nair',       initials: 'PN', joinedDate: '2024-06-22T10:00:00Z', totalOrders: 0,  totalSpent: 0,    status: 'active' },
    { email: 'tomas.i@example.com',    name: 'Tomás Ibarra',     initials: 'TI', joinedDate: '2024-05-28T10:00:00Z', totalOrders: 0,  totalSpent: 0,    status: 'active' },
    { email: 'freya.n@example.com',    name: 'Freya Nilsson',    initials: 'FN', joinedDate: '2024-06-01T10:00:00Z', totalOrders: 0,  totalSpent: 0,    status: 'inactive' },
    { email: 'malik.j@example.com',    name: 'Malik Johnson',    initials: 'MJ', joinedDate: '2024-06-25T10:00:00Z', totalOrders: 0,  totalSpent: 0,    status: 'active' },
];

// ── Service ──────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AdminCustomerService {
    private orderService = inject(AdminOrderService);

    readonly customers = signal<AdminCustomer[]>([...MOCK_CUSTOMERS]);

    readonly totalCount    = computed(() => this.customers().length);
    readonly activeCount   = computed(() => this.customers().filter(c => c.status === 'active').length);
    readonly inactiveCount = computed(() => this.customers().filter(c => c.status === 'inactive').length);

    getByEmail(email: string): AdminCustomer | undefined {
        return this.customers().find(c => c.email === email);
    }

    // Orders live in AdminOrderService, keyed by customer.email — this
    // just filters that list for the given customer. Note: only the
    // customers whose emails also appear in AdminOrderService's
    // MOCK_ORDERS will have real order history; the newer signups
    // (Grace Kim, Daniel Foster, etc.) with totalOrders: 0 will
    // correctly return an empty array here.
    getOrdersFor(email: string) {
        return this.orderService.orders().filter(o => o.customer.email === email);
    }
}