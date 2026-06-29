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

// ── DTO normaliser ────────────────────────────────────────────
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
    features:    CARRY_ON_FEATURES,
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

  private readonly _products = signal<Product[]>([]);
  readonly loading            = signal(false);
  readonly error              = signal<string | null>(null);
  readonly filter             = signal<ProductFilter>({ ...DEFAULT_FILTER });

  constructor() {
    this.loadFromApi();
  }

  loadFromApi(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<any>('/api/products').subscribe({
      next: (response) => {
        const dtos = response.content ?? response;
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