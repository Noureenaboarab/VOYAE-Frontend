// ============================================================
// VOYAE - Account / Profile Page
// ============================================================
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { Address, AddressCreateRequest, Order, UserProfile } from '../../core/models';
import { AccountResolvedData } from '../../core/resolvers/account.resolver';

type AccountSection = 'personal' | 'orders' | 'wishlist' | 'addresses' | 'payment' | 'preferences';

@Component({
  selector: 'voy-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);

  activeSection = signal<AccountSection>('personal');
  editingProfile = signal(false);
  orders = signal<Order[]>([]);
  ordersLoading = signal(false);
  ordersError = signal<string | null>(null);
  addresses = signal<Address[]>([]);
  addressesLoading = signal(false);
  addressesError = signal<string | null>(null);
  defaultAddressUpdatingId = signal<number | null>(null);
  deletingAddressId = signal<number | null>(null);
  addressFormVisible = signal(false);
  creatingAddress = signal(false);
  createAddressError = signal<string | null>(null);
  newAddress: AddressCreateRequest = {
    label: 'Home',
    street: '',
    city: '',
    country: '',
    postalCode: '',
  };

  private ordersLoaded = false;
  private addressesLoaded = false;

  navItems: { id: AccountSection; label: string; icon: string }[] = [
    { id: 'personal',    label: 'Personal Info',    icon: 'user' },
    { id: 'orders',      label: 'Orders',           icon: 'box' },
    { id: 'wishlist',    label: 'Wishlist',         icon: 'heart' },
    { id: 'addresses',   label: 'Addresses',        icon: 'map-pin' },
    { id: 'payment',     label: 'Payment Methods',  icon: 'credit-card' },
    { id: 'preferences', label: 'Preferences',      icon: 'settings' },
  ];

  activeSectionLabel = computed(() => {
    const id = this.activeSection();
    return this.navItems.find(n => n.id === id)?.label ?? '';
  });

  recentOrders = computed(() => this.orders().slice(0, 3));
  defaultAddress = computed(() => this.addresses().find(address => address.isDefault) ?? null);

  profile!: UserProfile;

  constructor() {
    const resolved: AccountResolvedData | null = this.route.snapshot.data['account'];

    if (resolved?.profile) {
      this.profile = resolved.profile;
    } else {
      this.profile = {
          id: 2,
          firstName: 'Sarah',
          lastName: 'Mitchell',
          name: 'Sarah Mitchell',
          email: 'sarah@example.com',
          gender: 'FEMALE',
          job: 'Designer',
          dateOfBirth: '1995-06-20',
          memberSince: '2026-06-26T16:23:14',
        };
    }

    this.loadOrders();
    this.loadAddresses();
  }

  signOut(): void {
    this.authService.logout();
  }

  setSection(id: AccountSection): void {
    this.activeSection.set(id);
    if (id === 'orders') {
      this.loadOrders();
    }
    if (id === 'addresses') {
      this.loadAddresses();
    }
  }

  getOrderDescription(order: Order): string {
    if (order.items.length === 0) return 'No items';

    const first = order.items[0];
    const firstLabel = first.type ? `${first.name} - ${first.type}` : first.name;
    return order.items.length === 1
      ? firstLabel
      : `${firstLabel} +${order.items.length - 1} more`;
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  formatTotal(total: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(total);
  }

  getItemCount(order: Order): string {
    const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
    return `${count} ${count === 1 ? 'item' : 'items'}`;
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

  formatAddress(address: Address): string {
    return [address.street, address.city, address.postalCode, address.country]
      .filter(Boolean)
      .join(', ');
  }

  showAddressForm(): void {
    this.addressFormVisible.set(true);
    this.createAddressError.set(null);
  }

  hideAddressForm(): void {
    this.addressFormVisible.set(false);
    this.createAddressError.set(null);
    this.newAddress = {
      label: 'Home',
      street: '',
      city: '',
      country: '',
      postalCode: '',
    };
  }

  submitAddress(): void {
    if (this.creatingAddress()) return;

    const draft = this.newAddress;
    this.createAddressError.set(null);
    this.creatingAddress.set(true);

    this.accountService.createAddress(draft).subscribe({
      next: () => {
        this.creatingAddress.set(false);
        this.hideAddressForm();
        this.loadAddresses(true);
      },
      error: err => {
        console.error('Failed to create address', err);
        this.createAddressError.set('Could not add this address. Please try again.');
        this.creatingAddress.set(false);
      },
    });
  }

  setDefaultAddress(address: Address): void {
    if (address.isDefault || this.defaultAddressUpdatingId() !== null) return;

    this.defaultAddressUpdatingId.set(address.id);
    this.addressesError.set(null);

    this.accountService.setDefaultAddress(address.id).subscribe({
      next: () => {
        this.defaultAddressUpdatingId.set(null);
        this.loadAddresses(true);
      },
      error: err => {
        console.error('Failed to update default address', err);
        this.addressesError.set('Could not update the default address. Please try again.');
        this.defaultAddressUpdatingId.set(null);
      },
    });
  }

  removeAddress(address: Address): void {
    if (this.deletingAddressId() !== null) return;

    const confirmed = window.confirm(`Remove ${address.label}?`);
    if (!confirmed) return;

    this.deletingAddressId.set(address.id);
    this.addressesError.set(null);

    this.accountService.deleteAddress(address.id).subscribe({
      next: () => {
        this.deletingAddressId.set(null);
        this.loadAddresses(true);
      },
      error: err => {
        console.error('Failed to delete address', err);
        this.addressesError.set('Could not remove this address. Please try again.');
        this.deletingAddressId.set(null);
      },
    });
  }

  private loadOrders(force = false): void {
    if (this.ordersLoaded && !force) return;

    this.ordersLoading.set(true);
    this.ordersError.set(null);

    this.accountService.getOrders().subscribe({
      next: orders => {
        this.orders.set(orders);
        this.ordersLoaded = true;
        this.ordersLoading.set(false);
      },
      error: err => {
        console.error('Failed to load account orders', err);
        this.ordersError.set('Could not load your orders. Please try again.');
        this.ordersLoading.set(false);
      },
    });
  }

  private loadAddresses(force = false): void {
    if (this.addressesLoaded && !force) return;

    this.addressesLoading.set(true);
    this.addressesError.set(null);

    this.accountService.getAddresses().subscribe({
      next: addresses => {
        this.addresses.set(addresses);
        this.addressesLoaded = true;
        this.addressesLoading.set(false);
      },
      error: err => {
        console.error('Failed to load account addresses', err);
        this.addressesError.set('Could not load your addresses. Please try again.');
        this.addressesLoading.set(false);
      },
    });
  }
}
