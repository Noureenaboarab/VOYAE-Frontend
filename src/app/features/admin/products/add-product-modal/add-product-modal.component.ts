// ============================================================
// VOYÆ — Add / Edit Product Modal
// ============================================================
import {
  Component, Input, Output, EventEmitter,
  OnInit, HostListener, inject, signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminProductService, joinName } from '../../../../core/services/admin-product.service';
import { AdminProduct } from '../../../../core/models/admin.models';

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
  saving     = signal(false);
  saveError  = signal<string | null>(null);

  categories = this.service.categoryOptions;

  formData = {
    type:        '',
    color:       '',
    price:       null as number | null,
    discount:    0,
    stock:       null as number | null,
    imageUrl:    '',
    description: '',
  };

  // ── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
    if (this.product) {
      this.isEditMode = true;
      this.formData = {
        type:        this.product.baseName,
        color:       this.product.color,
        price:       this.product.price,
        discount:    this.product.discount,
        stock:       this.product.stock,
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

  // ── Submit ───────────────────────────────────────────────
  onSubmit(form: NgForm): void {
    this.submitted = true;
    if (form.invalid) return;

    const name = joinName(this.formData.type, this.formData.color);
    const categoryId = this.service.getCategoryId(this.formData.type);

    this.saving.set(true);
    this.saveError.set(null);

    if (this.isEditMode && this.product) {
      this.service.updateProduct(this.product.id, {
        name,
        description: this.formData.description,
        basePrice:   this.formData.price ?? 0,
        discount:    this.formData.discount,
        categoryId,
        imageUrl:    this.formData.imageUrl,
        quantity:    this.formData.stock ?? 0,
      }).subscribe({
        next: () => { this.saving.set(false); this.close.emit(); },
        error: () => {
          this.saving.set(false);
          this.saveError.set('Failed to save changes. Please try again.');
        },
      });
    } else {
      this.service.addProduct({
        name,
        description: this.formData.description,
        basePrice:   this.formData.price ?? 0,
        discount:    this.formData.discount,
        categoryId,
        imageUrl:    this.formData.imageUrl,
        quantity:    this.formData.stock ?? 0,
      }).subscribe({
        next: () => { this.saving.set(false); this.close.emit(); },
        error: () => {
          this.saving.set(false);
          this.saveError.set('Failed to create product. Please try again.');
        },
      });
    }
  }
}