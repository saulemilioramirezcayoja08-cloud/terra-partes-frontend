import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../../../modules/customer/services/customer.service';
import { AuthService } from '../../../../../modules/auth/services/auth.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { Router } from '@angular/router';
import { CreateCustomerRequest } from '../../../../../modules/customer/post/models/create-customer-request.model';
import { ErrorResponse } from '../../../../../core/models/error-response.model';

@Component({
  selector: 'app-customer-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-create.html',
  styleUrl: './customer-create.css'
})
export class CustomerCreate {
  private readonly customerService = inject(CustomerService);
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

  createCustomer(): void {
    if (!this.canSave()) {
      alert(this.saveBlockReason());
      return;
    }

    const user = this.authService.currentUser;
    if (!user) {
      alert('Usuario no autenticado');
      return;
    }

    const request: CreateCustomerRequest = {
      name: this.name().trim(),
      taxId: this.taxId().trim() || undefined,
      phone: this.phone().trim() || undefined,
      email: this.email().trim() || undefined,
      address: this.address().trim() || undefined,
      userId: user.id
    };

    this.isLoading.set(true);

    this.customerService.createCustomer(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          alert(`Cliente ${response.data.name} creado exitosamente`);
          this.router.navigate(['/customer/list']);
        }
      },
      error: (err: ErrorResponse) => {
        this.isLoading.set(false);
        alert(this.errorHandler.handleError(err));
      }
    });
  }
}
