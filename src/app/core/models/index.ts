// ============================================================
// VOYÆ — Core Data Models
// ============================================================

export type ProductSize  = 'carry-on' | 'check-in' | 'large' | 'set';
export type ProductColor =
  | 'desert-sand'
  | 'obsidian-black'
  | 'chalk-white'
  | 'slate-grey'
  | 'navy-blue'
  | 'forest-green';

export interface ProductColorOption {
  id:    ProductColor;
  label: string;
  hex:   string;
}

export interface ProductFeature {
  title:       string;
  description: string;
}

export interface Product {
  id:           string;
  slug:         string;
  name:         string;
  type:         string;          // e.g. "The Carry-On"
  size:         ProductSize;
  color:        ProductColor;
  colorOptions: ProductColorOption[];
  price:        number;
  images:       string[];
  inStock:      boolean;
  isBestseller?: boolean;
  isNew?:        boolean;
  description?:  string;
  features?:     ProductFeature[];
  createdAt:    Date;
}

export interface CartItem {
  product:  Product;
  color:    ProductColor;
  quantity: number;
}

export interface Cart {
  items:     CartItem[];
  discount?: number;
  coupon?:   string;
}

export interface OrderItem {
  productId: string;
  name:      string;
  color:     ProductColor;
  size:      ProductSize;
  quantity:  number;
  price:     number;
}

export interface Order {
  id:     string;
  date:   string;
  items:  OrderItem[];
  status: 'processing' | 'shipped' | 'delivered' | 'returned';
  total:  number;
}

export interface UserProfile {
  firstName:   string;
  lastName:    string;
  email:       string;
  phone:       string;
  dateOfBirth: string;
  country:     string;
  memberSince: string;
  avatarUrl?:  string;
}

export interface ShippingOption {
  id:          string;
  label:       string;
  description: string;
  price:       number | 'free';
}

export interface Testimonial {
  quote:    string;
  author:   string;
  subtitle?: string;
}

export interface ProductFilter {
  sizes:    ProductSize[];
  colors:   ProductColor[];
  priceMin: number;
  priceMax: number;
  sortBy:   'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface AiSearchRequest {
  query: string;
}

export interface ProductRecommendation {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  discount: number;
  categoryName: string;
  imageUrl: string | null;
  quantity: number;
}

export interface AiSearchResponse {
  summary: string;
  products: ProductRecommendation[];
}