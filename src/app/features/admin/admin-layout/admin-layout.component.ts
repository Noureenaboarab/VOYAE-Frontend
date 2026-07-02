// ============================================================
// VOYÆ — Admin Product Service
// Mock data (24 products) — swap loadFromApi() bodies for live calls
// ============================================================
import { Injectable, signal, computed } from '@angular/core';
import { AdminProduct, AdminProductStatus } from '../../../core/models/admin.models';

// ── Helpers ─────────────────────────────────────────────────
function mkProduct(
  id: string, name: string, color: string, type: string,
  sku: string, price: number, stock: number | null,
  status: AdminProductStatus,
  badge: AdminProduct['badge'],
  imageUrl: string, createdAt: string,
): AdminProduct {
  return { id, name, color, type, sku, price, discount: 0, stock, status, badge, imageUrl, description: '', createdAt };
}

// ── Mock data (19 active, 3 low-stock, 2 out-of-stock = 24 total) ──
const MOCK_PRODUCTS: AdminProduct[] = [
  mkProduct('1',  'The Carry-On', 'Desert Sand',    'The Carry-On', 'VY-CO-DS',  295, 142,  'active',       'bestseller', '/assets/images/carry-on-desert-sand.jpg',    '2024-01-10T00:00:00Z'),
  mkProduct('2',  'The Carry-On', 'Obsidian Black', 'The Carry-On', 'VY-CO-OB',  295, 98,   'active',       null,         '/assets/images/carry-on-obsidian-black.jpg', '2024-01-10T00:00:00Z'),
  mkProduct('3',  'The Carry-On', 'Chalk White',    'The Carry-On', 'VY-CO-CW',  295, 76,   'active',       null,         '/assets/images/carry-on-chalk-white.jpg',    '2024-01-10T00:00:00Z'),
  mkProduct('4',  'The Check-In', 'Desert Sand',    'The Check-In', 'VY-CI-DS',  395, 54,   'active',       null,         '/assets/images/check-in-desert-sand.jpg',    '2024-02-14T00:00:00Z'),
  mkProduct('5',  'The Check-In', 'Slate Grey',     'The Check-In', 'VY-CI-SG',  395, 31,   'active',       'new',        '/assets/images/large-slate-grey.jpg',        '2024-03-01T00:00:00Z'),
  mkProduct('6',  'The Check-In', 'Navy Blue',      'The Check-In', 'VY-CI-NB',  395, null, 'out-of-stock', null,         '/assets/images/large-navy-blue.jpg',         '2024-02-14T00:00:00Z'),
  mkProduct('7',  'The Large',    'Forest Green',   'The Large',    'VY-LG-FG',  445, 19,   'low-stock',    null,         '/assets/images/large-forest-green.jpg',      '2024-03-20T00:00:00Z'),
  mkProduct('8',  'The Large',    'Obsidian Black', 'The Large',    'VY-LG-OB',  445, 63,   'active',       null,         '/assets/images/carry-on-obsidian-black.jpg', '2024-03-20T00:00:00Z'),
  mkProduct('9',  'The Carry-On', 'Sage Green',     'The Carry-On', 'VY-CO-SGR', 295, 45,   'active',       null,         '/assets/images/large-forest-green.jpg',      '2024-04-05T00:00:00Z'),
  mkProduct('10', 'The Carry-On', 'Midnight Blue',  'The Carry-On', 'VY-CO-MB',  295, 88,   'active',       null,         '/assets/images/large-navy-blue.jpg',         '2024-04-05T00:00:00Z'),
  mkProduct('11', 'The Carry-On', 'Forest Green',   'The Carry-On', 'VY-CO-FG',  295, 12,   'low-stock',    null,         '/assets/images/large-forest-green.jpg',      '2024-04-10T00:00:00Z'),
  mkProduct('12', 'The Check-In', 'Chalk White',    'The Check-In', 'VY-CI-CW',  395, 67,   'active',       null,         '/assets/images/carry-on-chalk-white.jpg',    '2024-02-14T00:00:00Z'),
  mkProduct('13', 'The Check-In', 'Obsidian Black', 'The Check-In', 'VY-CI-OB',  395, 34,   'active',       null,         '/assets/images/check-in-obsidian-black.jpg', '2024-02-14T00:00:00Z'),
  mkProduct('14', 'The Check-In', 'Forest Green',   'The Check-In', 'VY-CI-FG',  395, null, 'out-of-stock', null,         '/assets/images/large-forest-green.jpg',      '2024-05-01T00:00:00Z'),
  mkProduct('15', 'The Large',    'Desert Sand',    'The Large',    'VY-LG-DS',  445, 28,   'active',       null,         '/assets/images/carry-on-desert-sand.jpg',    '2024-03-20T00:00:00Z'),
  mkProduct('16', 'The Large',    'Chalk White',    'The Large',    'VY-LG-CW',  445, 41,   'active',       null,         '/assets/images/carry-on-chalk-white.jpg',    '2024-03-20T00:00:00Z'),
  mkProduct('17', 'The Large',    'Slate Grey',     'The Large',    'VY-LG-SG',  445, 15,   'low-stock',    null,         '/assets/images/large-slate-grey.jpg',        '2024-03-20T00:00:00Z'),
  mkProduct('18', 'The Large',    'Navy Blue',      'The Large',    'VY-LG-NB',  445, 52,   'active',       null,         '/assets/images/large-navy-blue.jpg',         '2024-03-20T00:00:00Z'),
  mkProduct('19', 'The Carry-On', 'Navy Blue',      'The Carry-On', 'VY-CO-NVY', 295, 73,   'active',       'bestseller', '/assets/images/large-navy-blue.jpg',         '2024-01-10T00:00:00Z'),
  mkProduct('20', 'The Carry-On', 'Slate Grey',     'The Carry-On', 'VY-CO-SLG', 295, 91,   'active',       null,         '/assets/images/large-slate-grey.jpg',        '2024-01-10T00:00:00Z'),
  mkProduct('21', 'The Check-In', 'Sage Green',     'The Check-In', 'VY-CI-SGR', 395, 26,   'active',       null,         '/assets/images/large-forest-green.jpg',      '2024-05-10T00:00:00Z'),
  mkProduct('22', 'The Check-In', 'Midnight Blue',  'The Check-In', 'VY-CI-MB',  395, 39,   'active',       null,         '/assets/images/large-navy-blue.jpg',         '2024-05-10T00:00:00Z'),
  mkProduct('23', 'The Large',    'Midnight Blue',  'The Large',    'VY-LG-MB',  445, 85,   'active',       'new',        '/assets/images/large-navy-blue.jpg',         '2024-06-01T00:00:00Z'),
  mkProduct('24', 'The Carry-On', 'Terracotta',     'The Carry-On', 'VY-CO-TC',  295, 61,   'active',       null,         '/assets/images/carry-on-desert-sand.jpg',    '2024-06-15T00:00:00Z'),
];

// ── Service ──────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AdminProductService {

  readonly products = signal<AdminProduct[]>([...MOCK_PRODUCTS]);

  // Tab counts (derived, exposed so components don't recompute)
  readonly totalCount      = computed(() => this.products().length);
  readonly activeCount     = computed(() => this.products().filter(p => p.status === 'active').length);
  readonly lowStockCount   = computed(() => this.products().filter(p => p.status === 'low-stock').length);
  readonly outOfStockCount = computed(() => this.products().filter(p => p.status === 'out-of-stock').length);

  // ── CRUD ──────────────────────────────────────────────────
  addProduct(product: AdminProduct): void {
    this.products.update(ps => [product, ...ps]);
  }

  updateProduct(updated: AdminProduct): void {
    this.products.update(ps =>
      ps.map(p => p.id === updated.id ? updated : p)
    );
  }

  deleteProduct(id: string): void {
    this.products.update(ps => ps.filter(p => p.id !== id));
  }
}