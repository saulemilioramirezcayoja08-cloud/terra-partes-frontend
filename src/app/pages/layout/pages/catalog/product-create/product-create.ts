import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../../modules/catalog/services/product.service';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { Router } from '@angular/router';
import { CodeRequest, CreateProductRequest } from '../../../../../modules/catalog/post/models/create-product-request.model';
import { ErrorResponse } from '../../../../../core/models/error-response.model';

interface CodeEntry extends CodeRequest {
  tempId: number;
}

@Component({
  selector: 'app-product-create',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './product-create.html',
  styleUrl: './product-create.css'
})
export class ProductCreate {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);
  readonly router = inject(Router);

  readonly isLoading = signal(false);

  readonly sku = signal('');
  readonly name = signal('');
  readonly description = signal('');
  readonly categoryId = signal<number | null>(null);
  readonly uom = signal('');
  readonly price = signal<number>(0);
  readonly codes = signal<CodeEntry[]>([]);

  private nextCodeId = 1;

  readonly newCodeType = signal('');
  readonly newCodeValue = signal('');

  readonly canSave = computed(() =>
    this.sku().trim() !== '' &&
    this.name().trim() !== '' &&
    this.uom().trim() !== '' &&
    this.price() >= 0
  );

  readonly saveBlockReason = computed(() => {
    if (this.sku().trim() === '') return 'El SKU es obligatorio';
    if (this.name().trim() === '') return 'El nombre es obligatorio';
    if (this.uom().trim() === '') return 'La unidad de medida es obligatoria';
    if (this.price() < 0) return 'El precio debe ser mayor o igual a 0';
    return '';
  });

  addCode(): void {
    const type = this.newCodeType().trim();
    const code = this.newCodeValue().trim();

    if (!type || !code) {
      alert('Completa el tipo y código antes de agregar');
      return;
    }

    const exists = this.codes().some(c => c.type === type && c.code === code);
    if (exists) {
      alert('Este código ya fue agregado');
      return;
    }

    this.codes.update(current => [...current, {
      tempId: this.nextCodeId++,
      type,
      code
    }]);

    this.newCodeType.set('');
    this.newCodeValue.set('');
  }

  removeCode(tempId: number): void {
    this.codes.update(current => current.filter(c => c.tempId !== tempId));
  }

  clearForm(): void {
    if (confirm('¿Limpiar todos los datos del formulario?')) {
      this.sku.set('');
      this.name.set('');
      this.description.set('');
      this.categoryId.set(null);
      this.uom.set('');
      this.price.set(0);
      this.codes.set([]);
      this.newCodeType.set('');
      this.newCodeValue.set('');
    }
  }

  createProduct(): void {
    if (!this.canSave()) {
      alert(this.saveBlockReason());
      return;
    }

    const user = this.authService.currentUser;
    if (!user) {
      alert('Usuario no autenticado');
      return;
    }

    const request: CreateProductRequest = {
      sku: this.sku().trim(),
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      categoryId: this.categoryId() || undefined,
      uom: this.uom().trim(),
      price: this.price(),
      userId: user.id,
      codes: this.codes().length > 0
        ? this.codes().map(c => ({ type: c.type, code: c.code }))
        : undefined
    };

    this.isLoading.set(true);

    this.productService.createProduct(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert(`Producto ${response.data.sku} creado exitosamente`);
          this.router.navigate(['/product/list']);
        }
      },
      error: (err: ErrorResponse) => {
        this.isLoading.set(false);
        alert(this.errorHandler.handleError(err));
      }
    });
  }

  trackByTempId(_: number, code: CodeEntry): number {
    return code.tempId;
  }
}