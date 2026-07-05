// ============================================================
// VOYÆ — Account / Profile Page
// ============================================================
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Order, UserProfile } from '../../core/models';
import { AccountResolvedData } from '../../core/resolvers/account.resolver';

type AccountSection = 'personal' | 'orders' | 'wishlist' | 'addresses' | 'payment' | 'preferences';

@Component({
  selector: 'voy-account',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  activeSection = signal<AccountSection>('personal');
  editingProfile = signal(false);

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

  profile!: UserProfile;
  recentOrders!: Order[];

  constructor() {
    const resolved: AccountResolvedData | null = this.route.snapshot.data['account'];

    if (resolved?.profile) {
      this.profile = resolved.profile;
    } else {
      this.profile = {
        firstName:   'Sarah',
        lastName:    'Mitchell',
        email:       'sarah.mitchell@email.com',
        phone:       '+1 (555) 214-8832',
        dateOfBirth: 'March 14, 1991',
        country:     'United States',
        memberSince: '2022',
        avatarUrl:   '/assets/images/avatar-sarah.jpg',
      };
    }

    this.recentOrders = [
      { id: '#VY-20481', date: 'Nov 12, 2024', items: [], status: 'delivered', total: 295 },
      { id: '#VY-19903', date: 'Sep 13, 2024', items: [], status: 'delivered', total: 395 },
      { id: '#VY-18574', date: 'Jun 28, 2024', items: [], status: 'delivered', total: 445 },
    ];
  }

  signOut(): void {
    this.authService.logout();
  }

  setSection(id: AccountSection): void {
    this.activeSection.set(id);
  }

  getOrderDescription(order: Order): string {
    const descriptions: Record<string, string> = {
      '#VY-20481': 'The Carry-On — Desert Sand',
      '#VY-19903': 'The Check-In — Obsidian Black',
      '#VY-18574': 'The Large — Forest Green',
    };
    return descriptions[order.id] ?? 'Order';
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
}