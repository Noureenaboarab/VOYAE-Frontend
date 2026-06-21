// ============================================================
// VOYÆ — Product Service
// ============================================================
import { Injectable, signal, computed } from '@angular/core';
import { Product, ProductFilter, ProductSize, ProductColor, ProductColorOption, ProductFeature } from '../models';

const COLOR_OPTIONS: ProductColorOption[] = [
  { id: 'desert-sand',    label: 'Desert Sand',    hex: '#C4724E' },
  { id: 'obsidian-black', label: 'Obsidian Black', hex: '#1A1916' },
  { id: 'chalk-white',    label: 'Chalk White',    hex: '#F0EDE8' },
  { id: 'slate-grey',     label: 'Slate Grey',     hex: '#7A7A7A' },
  { id: 'navy-blue',      label: 'Navy Blue',      hex: '#1B2A4A' },
  { id: 'forest-green',   label: 'Forest Green',   hex: '#2D4A34' },
];

const CARRY_ON_FEATURES: ProductFeature[] = [
  { title: 'Polycarbonate Shell', description: 'Flex-resistant outer shell engineered to absorb impact and spring back to form, every single time.' },
  { title: 'TSA-Approved Lock',   description: 'Integrated combination lock that TSA agents can open without damaging your luggage.' },
  { title: 'Silent Spinner Wheels', description: 'Precision-engineered 360° spinner wheels roll effortlessly over any surface without a sound.' },
  { title: 'Aircraft-Grade Aluminum Frame', description: 'Telescoping handle constructed from lightweight yet incredibly strong aircraft-grade aluminum.' },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id:           'co-desert-sand',
    slug:         'carry-on-desert-sand',
    name:         'Desert Sand',
    type:         'The Carry-On',
    size:         'carry-on',
    color:        'desert-sand',
    colorOptions: COLOR_OPTIONS,
    price:        295,
    images:       ['/assets/images/carry-on-desert-sand.jpg', '/assets/images/carry-on-desert-sand-2.jpg', '/assets/images/carry-on-desert-sand-3.jpg'],
    inStock:      true,
    isBestseller: true,
    description:  'The Carry-On in Desert Sand. Precision-built for people who move through the world with intent.',
    features:     CARRY_ON_FEATURES,
    createdAt:    new Date('2023-01-01'),
  },
  {
    id:           'co-obsidian-black',
    slug:         'carry-on-obsidian-black',
    name:         'Obsidian Black',
    type:         'The Carry-On',
    size:         'carry-on',
    color:        'obsidian-black',
    colorOptions: COLOR_OPTIONS,
    price:        295,
    images:       ['/assets/images/carry-on-obsidian-black.jpg'],
    inStock:      true,
    description:  'The Carry-On in Obsidian Black. A timeless silhouette for the modern traveller.',
    features:     CARRY_ON_FEATURES,
    createdAt:    new Date('2023-01-02'),
  },
  {
    id:           'co-chalk-white',
    slug:         'carry-on-chalk-white',
    name:         'Chalk White',
    type:         'The Carry-On',
    size:         'carry-on',
    color:        'chalk-white',
    colorOptions: COLOR_OPTIONS,
    price:        295,
    images:       ['/assets/images/carry-on-chalk-white.jpg', '/assets/images/carry-on-chalk-white-2.jpg', '/assets/images/carry-on-chalk-white-3.jpg'],
    inStock:      true,
    description:  'The Carry-On in Chalk White. Clean, crisp, and built to last.',
    features:     CARRY_ON_FEATURES,
    createdAt:    new Date('2023-01-03'),
  },
  {
    id:           'ci-desert-sand',
    slug:         'check-in-desert-sand',
    name:         'Desert Sand',
    type:         'The Check-In',
    size:         'check-in',
    color:        'desert-sand',
    colorOptions: COLOR_OPTIONS,
    price:        395,
    images:       ['/assets/images/check-in-desert-sand.jpg'],
    inStock:      true,
    isNew:        true,
    description:  'The Check-In in Desert Sand. More space, same uncompromising construction.',
    features:     CARRY_ON_FEATURES,
    createdAt:    new Date('2024-01-01'),
  },
  {
    id:           'ci-obsidian-black',
    slug:         'check-in-obsidian-black',
    name:         'Obsidian Black',
    type:         'The Check-In',
    size:         'check-in',
    color:        'obsidian-black',
    colorOptions: COLOR_OPTIONS,
    price:        395,
    images:       ['/assets/images/check-in-obsidian-black.jpg'],
    inStock:      true,
    description:  'The Check-In in Obsidian Black.',
    features:     CARRY_ON_FEATURES,
    createdAt:    new Date('2023-06-01'),
  },
  {
    id:           'lg-slate-grey',
    slug:         'large-slate-grey',
    name:         'Slate Grey',
    type:         'The Large',
    size:         'large',
    color:        'slate-grey',
    colorOptions: COLOR_OPTIONS,
    price:        445,
    images:       ['/assets/images/large-slate-grey.jpg'],
    inStock:      true,
    description:  'The Large in Slate Grey. Built for the long journey.',
    features:     CARRY_ON_FEATURES,
    createdAt:    new Date('2023-03-01'),
  },
  {
    id:           'lg-navy-blue',
    slug:         'large-navy-blue',
    name:         'Navy Blue',
    type:         'The Large',
    size:         'large',
    color:        'navy-blue',
    colorOptions: COLOR_OPTIONS,
    price:        445,
    images:       ['/assets/images/large-navy-blue.jpg'],
    inStock:      true,
    description:  'The Large in Navy Blue.',
    features:     CARRY_ON_FEATURES,
    createdAt:    new Date('2023-04-01'),
  },
  {
    id:           'lg-forest-green',
    slug:         'large-forest-green',
    name:         'Forest Green',
    type:         'The Large',
    size:         'large',
    color:        'forest-green',
    colorOptions: COLOR_OPTIONS,
    price:        445,
    images:       ['/assets/images/large-forest-green.jpg'],
    inStock:      false,
    description:  'The Large in Forest Green.',
    features:     CARRY_ON_FEATURES,
    createdAt:    new Date('2023-05-01'),
  },
];

const DEFAULT_FILTER: ProductFilter = {
  sizes:    [],
  colors:   [],
  priceMin: 0,
  priceMax: 9999,
  sortBy:   'featured',
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _products = signal<Product[]>(MOCK_PRODUCTS);
  readonly filter = signal<ProductFilter>({ ...DEFAULT_FILTER });

  readonly filteredProducts = computed(() => {
    const f   = this.filter();
    let items = this._products();

    if (f.sizes.length)  items = items.filter(p => f.sizes.includes(p.size));
    if (f.colors.length) items = items.filter(p => f.colors.includes(p.color));
    items = items.filter(p => p.price >= f.priceMin && p.price <= f.priceMax);

    switch (f.sortBy) {
      case 'price-asc':  items = [...items].sort((a, b) => a.price - b.price); break;
      case 'price-desc': items = [...items].sort((a, b) => b.price - a.price); break;
      case 'newest':     items = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break;
      default:           items = [...items].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0)); break;
    }
    return items;
  });

  getById(id: string): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  getBySlug(slug: string): Product | undefined {
    return this._products().find(p => p.slug === slug);
  }

  updateFilter(partial: Partial<ProductFilter>): void {
    this.filter.update(f => ({ ...f, ...partial }));
  }

  toggleSize(size: ProductSize): void {
    this.filter.update(f => {
      const sizes = f.sizes.includes(size)
        ? f.sizes.filter(s => s !== size)
        : [...f.sizes, size];
      return { ...f, sizes };
    });
  }

  toggleColor(color: ProductColor): void {
    this.filter.update(f => {
      const colors = f.colors.includes(color)
        ? f.colors.filter(c => c !== color)
        : [...f.colors, color];
      return { ...f, colors };
    });
  }

  resetFilter(): void {
    this.filter.set({ ...DEFAULT_FILTER });
  }
}