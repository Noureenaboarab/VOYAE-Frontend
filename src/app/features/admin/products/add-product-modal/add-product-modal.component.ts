// ============================================================
// VOYÆ — Add / Edit Product Modal
// ============================================================
import {
  Component, Input, Output, EventEmitter,
  OnInit, HostListener, inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminProductService } from '../../../../core/services/admin-product.service';
import { AdminProduct, AdminProductStatus, AdminProductBadge } from '../../../../core/models/admin.models';

@Component({
  selector: 'voy-add-product-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-product-modal.component.html',
  styleUrl: './add-product-modal.component.scss',
})
export class AddProductModalComponent implements OnInit {
  private service = inject(AdminProductService);

  @Input()  product: AdminProduct | null = null;
  @Output() close = new EventEmitter<void>();

  isEditMode = false;
  submitted  = false;

  categories = ['The Carry-On', 'The Check-In', 'The Large'];

  formData = {
    name:        '',
    color:       '',
    type:        '',
    sku:         '',
    price:       null as number | null,
    discount:    0,
    stock:       null as number | null,
    status:      'active' as AdminProductStatus,
    badge:       null as AdminProductBadge,
    imageUrl:    '',
    description: '',
  };

  // ── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
    if (this.product) {
      this.isEditMode = true;
      this.formData = {
        name:        this.product.name,
        color:       this.product.color,
        type:        this.product.type,
        sku:         this.product.sku,
        price:       this.product.price,
        discount:    this.product.discount,
        stock:       this.product.stock,
        status:      this.product.status,
        badge:       this.product.badge,
        imageUrl:    this.product.imageUrl,
        description: this.product.description,
      };
    }
  }

  // ── Keyboard / overlay dismiss ───────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void { this.close.emit(); }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  // ── SKU auto-generation ──────────────────────────────────
  private readonly TYPE_CODES: Record<string, string> = {
    'The Carry-On': 'CO',
    'The Check-In': 'CI',
    'The Large':    'LG',
  };

  generateSku(): void {
    const typeCode  = this.TYPE_CODES[this.formData.type] ?? '';
    const colorCode = this.formData.color
      .split(' ')
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
    this.formData.sku = typeCode && colorCode ? `VY-${typeCode}-${colorCode}` : '';
  }

  onTypeChange():  void { this.generateSku(); }
  onColorChange(): void { this.generateSku(); }

  // ── Submit ───────────────────────────────────────────────
  onSubmit(form: NgForm): void {
    this.submitted = true;
    if (form.invalid) return;

    if (this.isEditMode && this.product) {
      this.service.updateProduct({
        ...this.product,
        name:        this.formData.name,
        color:       this.formData.color,
        type:        this.formData.type,
        sku:         this.formData.sku,
        price:       this.formData.price ?? 0,
        discount:    this.formData.discount,
        stock:       this.formData.stock,
        status:      this.formData.status,
        badge:       this.formData.badge,
        imageUrl:    this.formData.imageUrl,
        description: this.formData.description,
      });
    } else {
      this.service.addProduct({
        id:          Date.now().toString(),
        name:        this.formData.name,
        color:       this.formData.color,
        type:        this.formData.type,
        sku:         this.formData.sku,
        price:       this.formData.price ?? 0,
        discount:    this.formData.discount,
        stock:       this.formData.stock,
        status:      this.formData.status,
        badge:       this.formData.badge,
        imageUrl:    this.formData.imageUrl,
        description: this.formData.description,
        createdAt:   new Date().toISOString(),
      });
    }

    this.close.emit();
  }
}