import { Component, computed, effect, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderCartService } from '../../../../../modules/order/services/order-cart-service';
import { OrderService } from '../../../../../modules/order/services/order.service';
import { CustomerService } from '../../../../../modules/customer/services/customer.service';
import { PaymentService } from '../../../../../modules/payment/services/payment.service';
import { Router } from '@angular/router';
import { CustomerListResponse } from '../../../../../modules/customer/get/models/customer-list-response.model';
import { WarehouseService } from '../../../../../modules/warehouse/services/warehouse.service';
import { WarehouseListResponse } from '../../../../../modules/warehouse/get/models/warehouse-list-response.model';
import { PaymentListResponse } from '../../../../../modules/payment/get/models/payment-list-response.model';
import { ErrorResponse } from '../../../../../core/models/error-response.model';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { Detail } from '../../../../../modules/order/get/models/order-preview.model';

@Component({
  selector: 'app-order-create',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './order-create.html',
  styleUrl: './order-create.css'
})
export class OrderCreate implements OnInit, OnDestroy {
  private readonly orderCartService = inject(OrderCartService);
  private readonly orderService = inject(OrderService);
  private readonly customerService = inject(CustomerService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly paymentService = inject(PaymentService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly router = inject(Router);

  readonly cart = this.orderCartService.cart;
  readonly details = this.orderCartService.details;
  readonly total = this.orderCartService.total;
  readonly pending = this.orderCartService.pending;
  readonly itemCount = this.orderCartService.itemCount;
  readonly totalPayments = this.orderCartService.totalPayments;

  readonly customers = signal<CustomerListResponse[]>([]);
  readonly warehouses = signal<WarehouseListResponse[]>([]);
  readonly payments = signal<PaymentListResponse[]>([]);

  readonly showCustomerDropdown = signal(false);
  readonly customerSearch = signal('');

  readonly showWarehouseDropdown = signal(false);
  readonly warehouseSearch = signal('');

  readonly showPaymentDropdown = signal(false);
  readonly paymentSearch = signal('');

  readonly filteredCustomers = computed(() => {
    const search = this.customerSearch().toLowerCase().trim();
    if (!search) return this.customers();
    return this.customers().filter(c =>
      c.name.toLowerCase().includes(search)
    );
  });

  readonly filteredWarehouses = computed(() => {
    const search = this.warehouseSearch().toLowerCase().trim();
    if (!search) return this.warehouses();
    return this.warehouses().filter(w =>
      w.name.toLowerCase().includes(search) ||
      w.code.toLowerCase().includes(search)
    );
  });

  readonly filteredPayments = computed(() => {
    const search = this.paymentSearch().toLowerCase().trim();
    if (!search) return this.payments();
    return this.payments().filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.code.toLowerCase().includes(search)
    );
  });

  notesModel = signal('');
  paymentModel = signal(0);

  readonly missingData = computed(() => ({
    customer: this.cart().customer.id === 0,
    warehouse: this.cart().warehouse.id === 0,
    payment: this.cart().payment.id === 0
  }));

  readonly hasWarnings = computed(() => {
    const missing = this.missingData();
    return missing.customer || missing.warehouse || missing.payment;
  });

  readonly warningMessage = computed(() => {
    const missing = this.missingData();
    const warnings: string[] = [];

    if (missing.customer) warnings.push('cliente');
    if (missing.warehouse) warnings.push('almacén');
    if (missing.payment) warnings.push('método de pago');

    if (warnings.length === 0) return '';

    return `Falta seleccionar: ${warnings.join(', ')}. Puedes agregar productos y completar estos datos después.`;
  });

  readonly canSave = computed(() =>
    this.itemCount() > 0 &&
    this.cart().customer.id > 0 &&
    this.cart().warehouse.id > 0 &&
    this.cart().payment.id > 0
  );

  readonly saveBlockReason = computed(() => {
    if (this.itemCount() === 0) return 'Agrega al menos un producto';
    if (this.cart().customer.id === 0) return 'Selecciona un cliente';
    if (this.cart().warehouse.id === 0) return 'Selecciona un almacén';
    if (this.cart().payment.id === 0) return 'Selecciona un método de pago';
    return '';
  });

  private keyboardListener?: (e: KeyboardEvent) => void;
  private clickListener?: () => void;
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    effect(() => {
      this.notesModel.set(this.cart().notes);
      this.paymentModel.set(this.totalPayments());
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.ensureCartReady();
    this.loadMasterData();

    if (this.isBrowser) {
      this.setupKeyboardShortcuts();
      this.showWarningsIfNeeded();
      this.setupClickListener();
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      if (this.keyboardListener) {
        document.removeEventListener('keydown', this.keyboardListener);
      }
      if (this.clickListener) {
        document.removeEventListener('click', this.clickListener);
      }
    }
  }

  private setupClickListener(): void {
    this.clickListener = () => {
      this.showCustomerDropdown.set(false);
      this.showWarehouseDropdown.set(false);
      this.showPaymentDropdown.set(false);
    };
    document.addEventListener('click', this.clickListener);
  }

  private ensureCartReady(): void {
    const cart = this.cart();

    if (!cart.currency) {
      this.initializeCart();
      return;
    }

    if (this.itemCount() > 0) {
      if (cart.customer.id === 0 || cart.warehouse.id === 0 || cart.payment.id === 0) {
        console.warn('Hay productos pero faltan datos maestros');
      }
      return;
    }

    if (cart.customer.id === 0) {
      this.initializeCart();
    }
  }

  private showWarningsIfNeeded(): void {
    setTimeout(() => {
      if (this.itemCount() > 0 && this.hasWarnings()) {
        console.info(this.warningMessage());
      }
    }, 500);
  }

  private initializeCart(): void {
    this.orderCartService.initialize({
      customer: { id: 0, name: '', address: '', taxId: '', phone: '' },
      warehouse: { id: 0, code: '', name: '', address: '' },
      payment: { id: 0, code: '', name: '' },
      currency: 'BOB'
    });
  }

  private loadMasterData(): void {
    this.customerService.getCustomers({ size: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customers.set(response.data.content);
        }
      },
      error: (err: ErrorResponse) => {
        console.error(this.errorHandler.handleError(err, 'Error al cargar clientes'));
      }
    });

    this.warehouseService.getWarehouses({ size: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.warehouses.set(response.data.content);
        }
      },
      error: (err: ErrorResponse) => {
        console.error(this.errorHandler.handleError(err, 'Error al cargar almacenes'));
      }
    });

    this.paymentService.getPayments({ size: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.payments.set(response.data.content);
        }
      },
      error: (err: ErrorResponse) => {
        console.error(this.errorHandler.handleError(err, 'Error al cargar métodos de pago'));
      }
    });
  }

  toggleCustomerDropdown(event: Event): void {
    event.stopPropagation();
    this.showCustomerDropdown.update(v => !v);
    this.customerSearch.set('');
  }

  selectCustomerFromDropdown(customer: CustomerListResponse, event: Event): void {
    event.stopPropagation();
    this.orderCartService.updateCustomer({
      id: customer.id,
      name: customer.name,
      address: customer.address,
      taxId: customer.taxId,
      phone: customer.phone
    });
    this.showCustomerDropdown.set(false);
    this.customerSearch.set('');
  }

  toggleWarehouseDropdown(event: Event): void {
    event.stopPropagation();
    this.showWarehouseDropdown.update(v => !v);
    this.warehouseSearch.set('');
  }

  selectWarehouseFromDropdown(warehouse: WarehouseListResponse, event: Event): void {
    event.stopPropagation();
    this.orderCartService.updateWarehouse({
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address
    });
    this.showWarehouseDropdown.set(false);
    this.warehouseSearch.set('');
  }

  togglePaymentDropdown(event: Event): void {
    event.stopPropagation();
    this.showPaymentDropdown.update(v => !v);
    this.paymentSearch.set('');
  }

  selectPaymentFromDropdown(payment: PaymentListResponse, event: Event): void {
    event.stopPropagation();
    this.orderCartService.updatePaymentMethod({
      id: payment.id,
      code: payment.code,
      name: payment.name
    });
    this.showPaymentDropdown.set(false);
    this.paymentSearch.set('');
  }

  updateDetailQuantity(productId: number, value: number): void {
    const quantity = Math.max(1, value);
    this.orderCartService.updateDetail(productId, { quantity });
  }

  updateDetailPrice(productId: number, value: number): void {
    const price = Math.max(0, value);
    this.orderCartService.updateDetail(productId, { price });
  }

  updateDetailName(productId: number, value: string): void {
    this.orderCartService.updateDetail(productId, { editableName: value });
  }

  updateDetailNotes(productId: number, value: string): void {
    this.orderCartService.updateDetail(productId, { notes: value });
  }

  removeDetail(productId: number): void {
    if (confirm('¿Eliminar este producto?')) {
      this.orderCartService.removeDetail(productId);
    }
  }

  updatePaymentAmount(amount: number): void {
    this.orderCartService.updatePaymentAmount(Math.max(0, amount));
  }

  updateOrderNotes(notes: string): void {
    this.orderCartService.updateNotes(notes);
  }

  clearAll(): void {
    if (this.itemCount() === 0) {
      alert('No hay nada que limpiar');
      return;
    }

    const message = this.itemCount() > 0
      ? `¿Seguro que deseas limpiar toda la orden? Se eliminarán ${this.itemCount()} producto(s).`
      : '¿Seguro que deseas limpiar toda la orden?';

    if (confirm(message)) {
      this.orderCartService.clear();
      this.initializeCart();
      this.notesModel.set('');
      this.paymentModel.set(0);
      alert('Orden limpiada completamente');
    }
  }

  createOrder(): void {
    if (!this.canSave()) {
      alert(this.saveBlockReason());
      return;
    }

    const invalidDetails = this.details().filter(d => d.quantity <= 0 || d.price < 0);
    if (invalidDetails.length > 0) {
      alert('Todos los productos deben tener cantidad > 0 y precio >= 0');
      return;
    }

    if (this.pending() < 0) {
      alert('El anticipo no puede ser mayor al total de la orden');
      return;
    }

    const request = this.orderCartService.toApiRequest();
    console.log('Request:', JSON.stringify(request, null, 2));

    this.orderService.createOrder(request).subscribe({
      next: (response) => {
        console.log('Response:', JSON.stringify(response, null, 2));

        if (response.success && response.data) {
          this.orderCartService.saveCurrentOrder(response.data);
          alert(`Orden ${response.data.number} creada exitosamente`);
          this.orderCartService.clear();
          this.initializeCart();
          this.notesModel.set('');
          this.paymentModel.set(0);
        }
      },
      error: (err: ErrorResponse) => {
        console.error('Error:', err);
        alert(this.errorHandler.handleError(err, 'Error al crear orden'));
      }
    });
  }

  previewOrder(): void {
    if (this.itemCount() === 0) {
      alert('Agrega al menos un producto para previsualizar');
      return;
    }

    if (this.hasWarnings()) {
      const proceed = confirm(
        `${this.warningMessage()}\n\n¿Deseas continuar con la previsualización?`
      );
      if (!proceed) return;
    }

    window.open('/order/print?mode=preview', '_blank');
  }

  viewLastOrder(): void {
    const lastOrder = this.orderCartService.getCurrentOrder();
    if (!lastOrder) {
      alert('No hay ninguna orden generada aún');
      return;
    }
    window.open('/order/print?mode=current', '_blank');
  }

  private setupKeyboardShortcuts(): void {
    if (this.keyboardListener) {
      document.removeEventListener('keydown', this.keyboardListener);
    }

    this.keyboardListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toUpperCase()) {
          case 'P':
            e.preventDefault();
            this.router.navigate(['/order/select-product']);
            break;
          case 'S':
            e.preventDefault();
            if (this.canSave()) {
              this.createOrder();
            } else {
              alert(this.saveBlockReason());
            }
            break;
          case 'C':
            e.preventDefault();
            this.selectCustomer();
            break;
          case 'A':
            e.preventDefault();
            this.selectWarehouse();
            break;
          case 'M':
            e.preventDefault();
            this.selectPaymentMethod();
            break;
          case 'L':
            e.preventDefault();
            this.clearAll();
            break;
        }
      }
    };

    document.addEventListener('keydown', this.keyboardListener);
  }

  private selectWarehouse(): void {
    if (this.warehouses().length === 0) {
      alert('Cargando almacenes... Intenta nuevamente en un momento.');
      return;
    }

    const id = prompt('Ingresa el ID del almacén:');
    if (!id) return;

    const warehouse = this.warehouses().find(w => w.id === parseInt(id));
    if (warehouse) {
      this.orderCartService.updateWarehouse({
        id: warehouse.id,
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address
      });
      alert(`Almacén actualizado: ${warehouse.name}`);
    } else {
      alert('Almacén no encontrado. Verifica el ID.');
    }
  }

  private selectCustomer(): void {
    if (this.customers().length === 0) {
      alert('Cargando clientes... Intenta nuevamente en un momento.');
      return;
    }

    const id = prompt('Ingresa el ID del cliente:');
    if (!id) return;

    const customer = this.customers().find(c => c.id === parseInt(id));
    if (customer) {
      this.orderCartService.updateCustomer({
        id: customer.id,
        name: customer.name,
        address: customer.address,
        taxId: customer.taxId,
        phone: customer.phone
      });
      alert(`Cliente actualizado: ${customer.name}`);
    } else {
      alert('Cliente no encontrado. Verifica el ID.');
    }
  }

  private selectPaymentMethod(): void {
    if (this.payments().length === 0) {
      alert('Cargando métodos de pago... Intenta nuevamente en un momento.');
      return;
    }

    const id = prompt('Ingresa el ID del método de pago:');
    if (!id) return;

    const payment = this.payments().find(p => p.id === parseInt(id));
    if (payment) {
      this.orderCartService.updatePaymentMethod({
        id: payment.id,
        code: payment.code,
        name: payment.name
      });
      alert(`Método de pago actualizado: ${payment.name}`);
    } else {
      alert('Método de pago no encontrado. Verifica el ID.');
    }
  }

  trackByProductId(_: number, detail: Detail): number {
    return detail.productId;
  }

  trackByCustomerId(_: number, customer: CustomerListResponse): number {
    return customer.id;
  }

  trackByWarehouseId(_: number, warehouse: WarehouseListResponse): number {
    return warehouse.id;
  }

  trackByPaymentId(_: number, payment: PaymentListResponse): number {
    return payment.id;
  }
}