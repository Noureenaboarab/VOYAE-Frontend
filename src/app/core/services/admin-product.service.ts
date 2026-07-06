// ============================================================
// VOYÆ — Admin Product Service
// Talks to /api/admin/products on the Java backend.
// ============================================================
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AdminProduct,
  AdminProductResponse,
  AdminProductStatus,
  ProductCreateRequest,
  ProductUpdateRequest,
} from '../models/admin.models';

const NAME_SEPARATOR = ' — ';

// TODO: replace with a real categories lookup (e.g. GET /api/categories)
// once that endpoint exists. These IDs must match your `categories` table.
const CATEGORY_IDS: Record<string, number> = {
  'The Carry-On': 1,
  'The Check-In': 2,
  'The Large':    3,
};

const LOW_STOCK_THRESHOLD = 20;

function computeStatus(quantity: number | null): AdminProductStatus {
  if (!quantity || quantity <= 0) return 'out-of-stock';
  if (quantity < LOW_STOCK_THRESHOLD) return 'low-stock';
  return 'active';
}

function splitName(name: string): { baseName: string; color: string } {
  const idx = name.indexOf(NAME_SEPARATOR);
  if (idx === -1) return { baseName: name, color: '' };
  return {
    baseName: name.slice(0, idx).trim(),
    color:    name.slice(idx + NAME_SEPARATOR.length).trim(),
  };
}

export function joinName(type: string, color: string): string {
  return color ? `${type}${NAME_SEPARATOR}${color}` : type;
}

function mapToAdminProduct(res: AdminProductResponse): AdminProduct {
  const { baseName, color } = splitName(res.name);
  return {
    id:           String(res.id),
    name:         res.name,
    baseName,
    color,
    categoryId:   res.categoryId,
    categoryName: res.categoryName ?? '',
    price:        res.basePrice,
    discount:     res.discount,
    stock:        res.quantity,
    status:       computeStatus(res.quantity),
    imageUrl:     res.imageUrl,
    description:  res.description,
    createdAt:    res.createdAt,
    deleted:      res.deleted,
  };
}

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/products';

  readonly products = signal<AdminProduct[]>([]);
  readonly loading   = signal(false);
  readonly error     = signal<string | null>(null);

  // Tab counts (derived, exposed so components don't recompute)
  readonly totalCount      = computed(() => this.products().length);
  readonly activeCount     = computed(() => this.products().filter(p => p.status === 'active').length);
  readonly lowStockCount   = computed(() => this.products().filter(p => p.status === 'low-stock').length);
  readonly outOfStockCount = computed(() => this.products().filter(p => p.status === 'out-of-stock').length);

  // ── Category helper (exposed for the modal's <select>) ────
  readonly categoryOptions = Object.keys(CATEGORY_IDS);

  getCategoryId(type: string): number | null {
    return CATEGORY_IDS[type] ?? null;
  }

  // ── Load ─────────────────────────────────────────────────
  loadProducts(): Observable<AdminProductResponse[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<AdminProductResponse[]>(this.baseUrl).pipe(
        tap({
          next: (list) => {
            this.products.set(list.map(mapToAdminProduct));
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Failed to load products.');
            this.loading.set(false);
          },
        })
    );
  }

  // ── CRUD ──────────────────────────────────────────────────
  addProduct(request: ProductCreateRequest): Observable<AdminProductResponse> {
    return this.http.post<AdminProductResponse>(this.baseUrl, request).pipe(
        tap(created => {
          this.products.update(ps => [mapToAdminProduct(created), ...ps]);
        })
    );
  }

  updateProduct(id: string, request: ProductUpdateRequest): Observable<AdminProductResponse> {
    return this.http.patch<AdminProductResponse>(`${this.baseUrl}/${id}`, request).pipe(
        tap(updated => {
          const mapped = mapToAdminProduct(updated);
          this.products.update(ps => ps.map(p => p.id === mapped.id ? mapped : p));
        })
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
        tap(() => {
          this.products.update(ps => ps.filter(p => p.id !== id));
        })
    );
  }

  restoreProduct(id: string): Observable<AdminProductResponse> {
    return this.http.post<AdminProductResponse>(`${this.baseUrl}/${id}/restore`, {}).pipe(
        tap(restored => {
          const mapped = mapToAdminProduct(restored);
          this.products.update(ps => ps.map(p => p.id === mapped.id ? mapped : p));
        })
    );
  }
}