// ============================================================
// VOYÆ — Core Data Models (backend-aligned)
// ============================================================

export interface ProductFeature {
  title:       string;
  description: string;
}

export interface Product {
  id:           string;
  name:         string;
  type:         string;        // category name, e.g. "The Carry-On"
  price:        number;        // mapped from basePrice
  discount:     number;        // 0 if none
  imageUrl:     string;        // single image
  inStock:      boolean;       // quantity > 0
  isBestseller?: boolean;      // hardcoded in PRODUCT_META
  isNew?:        boolean;      // hardcoded in PRODUCT_META
  description?:  string;
  features?:     ProductFeature[];  // hardcoded in PRODUCT_META
  createdAt:    string;        // ISO string
}

// Mirrors org.packify.cart.CartItemResponse exactly.
// Note: this is a FLAT shape (no nested `product` object) — the backend
// returns productName/productImage/etc. directly on the item.
export interface CartItemResponse {
  id:             number;
  productId:      number;
  productName:    string;
  productImage:   string | null;
  unitPrice:      number;   // BigDecimal -> number
  discount:       number;
  effectivePrice: number;
  quantity:       number;
  subtotal:       number;
  offerId:        number | null;
}

// Mirrors org.packify.cart.CartResponse exactly.
export interface CartResponse {
  id:        number;
  items:     CartItemResponse[];
  itemCount: number;
  subtotal:  number;
}

export interface OrderItem {
  productId: string;
  name:      string;
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
  id?:          number;
  name?:        string;
  firstName:    string;
  lastName:     string;
  email:        string;
  phone?:       string;
  dateOfBirth?: string;
  job?:         string;
  gender?:      string;
  street?:      string;
  city?:        string;
  country:      string;
  postalCode?:  string;
  memberSince:  string;
  avatarUrl?:   string;
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
  types:    string[];
  priceMin: number;
  priceMax: number;
  sortBy:   'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface OfferProduct {
  id:          number;
  name:        string;
  basePrice:   number;
  discount:    number;
  imageUrl?:   string;
}

export interface Offer {
  id:            number;
  name:          string;
  description:   string;
  bundlePrice:   number;
  originalTotal: number;
  savings:       number;
  products:      OfferProduct[];
  createdAt:     string;
}

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface AuthResponse {
  token:   string;
  email?:  string;
  name?:   string;
}

export interface RegisterRequest {
  name:            string;
  email:           string;
  password:        string;
  confirmPassword: string;
  birthday?:       string;
  job?:            string;
  gender?:         string;
  street?:         string;
  city?:           string;
  country?:        string;
  postalCode?:     string;
  categoryIds?:    number[];
}

export interface AiSearchRequest {
  query: string;
}

export interface ProductRecommendation {
  id:           number;
  name:         string;
  description:  string;
  basePrice:    number;
  discount:     number;
  categoryName: string;
  imageUrl:     string | null;
  quantity:     number;
}

export interface AiSearchResponse {
  summary:  string;
  products: ProductRecommendation[];
}

// Raw shape the Spring backend returns for a Product entity or DTO.
// Handles both a flat DTO (categoryName) and a nested entity (category.name).
export interface ProductDTO {
  id:           number;
  name:         string;
  description:  string;
  // Spring serialises BigDecimal as a number in JSON by default
  basePrice:    number | string;
  discount:     number | string;
  // Flat DTO field (if backend maps category → categoryName)
  categoryName?: string;
  // Nested entity field (if backend returns the Category object directly)
  category?:    { id?: number; name?: string };
  imageUrl:     string | null;
  // Flat DTO field (if backend derives inStock from quantity)
  inStock?:     boolean;
  // Raw entity field
  quantity?:    number;
  createdAt:    string;
}