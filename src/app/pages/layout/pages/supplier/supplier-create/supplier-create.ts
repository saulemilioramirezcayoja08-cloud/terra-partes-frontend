import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../../../../modules/supplier/services/supplier.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { Router } from '@angular/router';
import { CreateSupplierRequest } from '../../../../../modules/supplier/post/models/create-supplier-request.model';
import { ErrorResponse } from '../../../../../core/models/error-response.model';

@Component({
  selector: 'app-supplier-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-create.html',
  styleUrl: './supplier-create.css'
})
export class SupplierCreate {
  private readonly supplierService = inject(SupplierService);
  private readonly authService = inject(AuthService);
  private readonly errorHandler = inject(ErrorHandlerService);
  readonly router = inject(Router);

  readonly isLoading = signal(false);

  readonly taxId = signal('');
  readonly name = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly address = signal('');

  readonly canSave = computed(() =>
    this.name().trim() !== ''
  );

  readonly saveBlockReason = computed(() => {
    if (this.name().trim() === '') return 'El nombre es obligatorio';
    return '';
  });

  clearForm(): void {
    if (confirm('¿Limpiar todos los datos del formulario?')) {
      this.taxId.set('');
      this.name.set('');
      this.phone.set('');
      this.email.set('');
      this.address.set('');
    }
  }

  createSupplier(): void {
    if (!this.canSave()) {
      alert(this.saveBlockReason());
      return;
    }

    const user = this.authService.currentUser;
    if (!user) {
      alert('Usuario no autenticado');
      return;
    }

    const request: CreateSupplierRequest = {
      name: this.name().trim(),
      taxId: this.taxId().trim() || undefined,
      phone: this.phone().trim() || undefined,
      email: this.email().trim() || undefined,
      address: this.address().trim() || undefined,
      userId: user.id
    };

    this.isLoading.set(true);

    this.supplierService.createSupplier(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert(`Proveedor ${response.data.name} creado exitosamente`);
          this.router.navigate(['/supplier/list']);
        }
      },
      error: (err: ErrorResponse) => {
        this.isLoading.set(false);
        alert(this.errorHandler.handleError(err));
      }
    });
  }
}