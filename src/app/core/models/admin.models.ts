// ============================================================
// VOYÆ — Admin Data Models
// ============================================================

// ── Product types (frontend view model) ─────────────────────
// NOTE: status is always derived from `stock` — it is never sent to
// or received from the backend, since Product has no status column.
export type AdminProductStatus = 'active' | 'low-stock' | 'out-of-stock';

export interface AdminProduct {
  id:           string;
  name:         string;   // full backend name, e.g. "The Carry-On — Desert Sand"
  baseName:     string;   // left of " — ", the category/type label, e.g. "The Carry-On"
  color:        string;   // right of " — ", e.g. "Desert Sand"
  categoryId:   number | null;
  categoryName: string;
  price:        number;
  discount:     number;
  stock:        number | null;
  status:       AdminProductStatus;
  imageUrl:     string;
  description:  string;
  createdAt:    string;
  deleted:      boolean;
}

export type AdminProductTab = 'all' | AdminProductStatus;

// Shape the Add/Edit form works with in the UI
export interface AddProductFormData {
  type:        string;         // category label, e.g. "The Carry-On"
  color:       string;
  price:       number | null;
  discount:    number;
  stock:       number | null;
  imageUrl:    string;
  description: string;
}

// ── Backend DTOs (mirror org.packify.admin.product.*) ───────
export interface AdminProductResponse {
  id:           number;
  name:         string;
  description:  string;
  basePrice:    number;
  discount:     number;
  categoryName: string | null;
  categoryId:   number | null;
  imageUrl:     string;
  quantity:     number;
  inStock:      boolean;
  deleted:      boolean;
  version:      number;
  createdAt:    string;
}

export interface ProductCreateRequest {
  name:        string;
  description?: string;
  basePrice:   number;
  discount?:   number;
  categoryId?: number | null;
  imageUrl?:   string;
  quantity:    number;
}

export interface ProductUpdateRequest {
  name?:        string;
  description?: string;
  basePrice?:   number;
  discount?:    number;
  categoryId?:  number | null;
  imageUrl?:    string;
  quantity?:    number;
}

// ── Order types ──────────────────────────────────────────────
export type AdminOrderStatus = 'processing' | 'shipped' | 'delivered' | 'returned';
export type AdminOrderTab    = 'all' | AdminOrderStatus;

export interface AdminOrderItem {
  productId: string;
  name:      string;
  color:     string;
  quantity:  number;
  price:     number;
}

export interface AdminOrderCustomer {
  name:     string;
  email:    string;
  initials: string;
}

export interface AdminOrder {
  id:       string;
  date:     string;
  customer: AdminOrderCustomer;
  items:    AdminOrderItem[];
  total:    number;
  status:   AdminOrderStatus;
}

export type AdminCustomerStatus = 'active' | 'inactive';
export type AdminCustomerTab    = 'all' | AdminCustomerStatus;

export interface AdminCustomer {
  email:       string;
  name:        string;
  initials:    string;
  joinedDate:  string; // ISO
  totalOrders: number;
  totalSpent:  number;
  status:      AdminCustomerStatus;
}

// Richer shape returned by GET /api/admin/users/{id} on the real
// backend (AdminCustomerHttpService). orderNumber/orderDate/etc.
// are still placeholders pending the real Order entity fields.
export interface AdminCustomerOrderSummary {
  orderNumber: string;
  orderDate:   string;
  itemCount:   number;
  total:       number;
  status:      string;
}

export interface AdminCustomerDetail extends AdminCustomer {
  job?:       string | null;
  addresses?: { city: string; country: string }[];
  orders:     AdminCustomerOrderSummary[];
}

//  Generic paging wrapper
// Matches Spring Data's Page<T> JSON shape.
export interface Page<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  number:        number; // current page, 0-indexed
  size:          number;
}