// ============================================================
// VOYÆ — Product Service (backend-aligned, mock data preserved)
// ============================================================
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, ProductDTO, ProductFeature, ProductFilter } from '../models';

// ── Hardcoded per-product metadata ───────────────────────────
interface ProductMeta {
  features?:     ProductFeature[];
  isBestseller?: boolean;
  isNew?:        boolean;
}

const CARRY_ON_FEATURES: ProductFeature[] = [
  { title: 'Polycarbonate Shell',           description: 'Flex-resistant outer shell engineered to absorb impact and spring back to form, every single time.' },
  { title: 'TSA-Approved Lock',             description: 'Integrated combination lock that TSA agents can open without damaging your luggage.' },
  { title: 'Silent Spinner Wheels',         description: 'Precision-engineered 360° spinner wheels roll effortlessly over any surface without a sound.' },
  { title: 'Aircraft-Grade Aluminum Frame', description: 'Telescoping handle constructed from lightweight yet incredibly strong aircraft-grade aluminum.' },
];

// ── Mock data ─────────────────────────────────────────────────
// Matches the updated Product interface (no slug/size/color/colorOptions/images[]).
// This is the source of truth until the backend API is wired up.
const MOCK_PRODUCTS: Product[] = [
  {
    id:           '1',
    name:         'Desert Sand',
    type:         'The Carry-On',
    price:        295,
    discount:     0,
    imageUrl:     '/assets/images/carry-on-desert-sand.jpg',
    inStock:      true,
    isBestseller: true,
    description:  'The Carry-On in Desert Sand. Precision-built for people who move through the world with intent.',
    features:     CARRY_ON_FEATURES,
    createdAt:    '2023-01-01T00:00:00',
  },
  {
    id:           '2',
    name:         'Obsidian Black',
    type:         'The Carry-On',
    price:        295,
    discount:     0,
    imageUrl:     '/assets/images/carry-on-obsidian-black.jpg',
    inStock:      true,
    description:  'The Carry-On in Obsidian Black. A timeless silhouette for the modern traveller.',
    features:     CARRY_ON_FEATURES,
    createdAt:    '2023-01-02T00:00:00',
  },
  {
    id:           '3',
    name:         'Chalk White',
    type:         'The Carry-On',
    price:        295,
    discount:     0,
    imageUrl:     '/assets/images/carry-on-chalk-white.jpg',
    inStock:      true,
    description:  'The Carry-On in Chalk White. Clean, crisp, and built to last.',
    features:     CARRY_ON_FEATURES,
    createdAt:    '2023-01-03T00:00:00',
  },
  {
    id:           '4',
    name:         'Desert Sand',
    type:         'The Check-In',
    price:        395,
    discount:     0,
    imageUrl:     '/assets/images/check-in-desert-sand.jpg',
    inStock:      true,
    isNew:        true,
    description:  'The Check-In in Desert Sand. More space, same uncompromising construction.',
    features:     CARRY_ON_FEATURES,
    createdAt:    '2024-01-01T00:00:00',
  },
  {
    id:           '5',
    name:         'Obsidian Black',
    type:         'The Check-In',
    price:        395,
    discount:     0,
    imageUrl:     '/assets/images/check-in-obsidian-black.jpg',
    inStock:      true,
    description:  'The Check-In in Obsidian Black.',
    features:     CARRY_ON_FEATURES,
    createdAt:    '2023-06-01T00:00:00',
  },
  {
    id:           '6',
    name:         'Slate Grey',
    type:         'The Large',
    price:        445,
    discount:     0,
    imageUrl:     '/assets/images/large-slate-grey.jpg',
    inStock:      true,
    description:  'The Large in Slate Grey. Built for the long journey.',
    features:     CARRY_ON_FEATURES,
    createdAt:    '2023-03-01T00:00:00',
  },
  {
    id:           '7',
    name:         'Navy Blue',
    type:         'The Large',
    price:        445,
    discount:     0,
    imageUrl:     '/assets/images/large-navy-blue.jpg',
    inStock:      true,
    description:  'The Large in Navy Blue.',
    features:     CARRY_ON_FEATURES,
    createdAt:    '2023-04-01T00:00:00',
  },
  {
    id:           '8',
    name:         'Forest Green',
    type:         'The Large',
    price:        445,
    discount:     0,
    imageUrl:     '/assets/images/large-forest-green.jpg',
    inStock:      false,
    description:  'The Large in Forest Green.',
    features:     CARRY_ON_FEATURES,
    createdAt:    '2023-05-01T00:00:00',
  },
];

// ── DTO normaliser ────────────────────────────────────────────
// Used only when the real API is called. Handles both a flat Spring DTO
// (categoryName, inStock) and the raw @Entity shape (category.name, quantity).
function toProduct(dto: ProductDTO): Product {
  const type    = dto.categoryName ?? dto.category?.name ?? '';
  const inStock = dto.inStock !== undefined
    ? dto.inStock
    : (dto.quantity ?? 0) > 0;

  return {
    id:          String(dto.id),
    name:        dto.name,
    type,
    price:       Number(dto.basePrice),
    discount:    Number(dto.discount ?? 0),
    imageUrl:    dto.imageUrl ?? '',
    inStock,
    description: dto.description,
    createdAt:   dto.createdAt,
  };
}

const DEFAULT_FILTER: ProductFilter = {
  types:    [],
  priceMin: 0,
  priceMax: 9999,
  sortBy:   'featured',
};

// ── Service ──────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  // Start with mock data so the UI is never empty
  private readonly _products = signal<Product[]>(MOCK_PRODUCTS);
  readonly loading            = signal(false);
  readonly error              = signal<string | null>(null);
  readonly filter             = signal<ProductFilter>({ ...DEFAULT_FILTER });

  // Call this once the backend API is ready.
  // Until then the UI runs entirely off MOCK_PRODUCTS above.
  loadFromApi(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<ProductDTO[]>('/api/products').subscribe({
      next: (dtos) => {
        this._products.set(dtos.map(toProduct));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.error.set('Could not load products. Please try again.');
        this.loading.set(false);
      },
    });
  }

  readonly filteredProducts = computed(() => {
    const f   = this.filter();
    let items = this._products();

    if (f.types.length) {
      items = items.filter(p => f.types.includes(p.type));
    }
    if (f.priceMin > 0) {
      items = items.filter(p => p.price >= f.priceMin);
    }
    if (f.priceMax < 9999) {
      items = items.filter(p => p.price <= f.priceMax);
    }

    switch (f.sortBy) {
      case 'price-asc':
        items = [...items].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items = [...items].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        items = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        items = [...items].sort(
          (a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0)
        );
        break;
    }

    return items;
  });

  readonly availableTypes = computed(() =>
    [...new Set(this._products().map(p => p.type).filter(Boolean))].sort()
  );

  getById(id: string): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  updateFilter(partial: Partial<ProductFilter>): void {
    this.filter.update(f => ({ ...f, ...partial }));
  }

  toggleType(type: string): void {
    this.filter.update(f => {
      const types = f.types.includes(type)
        ? f.types.filter(t => t !== type)
        : [...f.types, type];
      return { ...f, types };
    });
  }

  resetFilter(): void {
    this.filter.set({ ...DEFAULT_FILTER });
  }
}