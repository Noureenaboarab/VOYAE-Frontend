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

export interface CartItem {
  product:  Product;
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
  types:    string[];
  priceMin: number;
  priceMax: number;
  sortBy:   'featured' | 'price-asc' | 'price-desc' | 'newest';
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