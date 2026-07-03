// ============================================================
// VOYÆ — Admin Data Models
// ============================================================

export type AdminProductStatus = 'active' | 'low-stock' | 'out-of-stock';
export type AdminProductBadge  = 'bestseller' | 'new' | null;

export interface AdminProduct {
  id:          string;
  name:        string;         // "The Carry-On"
  color:       string;         // "Desert Sand"
  type:        string;         // category — same as name for VOYÆ
  sku:         string;         // "VY-CO-DS"
  price:       number;         // 295
  discount:    number;         // 0 if none
  stock:       number | null;  // null = out of stock → rendered as —
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