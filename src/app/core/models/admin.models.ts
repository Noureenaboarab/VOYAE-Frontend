// ============================================================
// VOYÆ — Admin Data Models
// ============================================================

// ── Product types ────────────────────────────────────────────
export type AdminProductStatus = 'active' | 'low-stock' | 'out-of-stock';
export type AdminProductBadge  = 'bestseller' | 'new' | null;

export interface AdminProduct {
  id:          string;
  name:        string;
  color:       string;
  type:        string;
  sku:         string;
  price:       number;
  discount:    number;
  stock:       number | null;
  status:      AdminProductStatus;
  badge:       AdminProductBadge;
  imageUrl:    string;
  description: string;
  createdAt:   string;
}

export type AdminProductTab = 'all' | 'active' | 'low-stock' | 'out-of-stock';

export interface AddProductFormData {
  name:        string;
  color:       string;
  type:        string;
  sku:         string;
  price:       number | null;
  discount:    number;
  stock:       number | null;
  status:      AdminProductStatus;
  badge:       AdminProductBadge;
  imageUrl:    string;
  description: string;
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