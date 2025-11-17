import { Component, computed, effect, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuotationCartService } from '../../../../../modules/quotation/services/quotation-cart-service';
import { QuotationService } from '../../../../../modules/quotation/services/quotation.service';
import { CustomerService } from '../../../../../modules/customer/services/customer.service';
import { WarehouseService } from '../../../../../modules/warehouse/services/warehouse.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { Router } from '@angular/router';
import { CustomerListResponse } from '../../../../../modules/customer/get/models/customer-list-response.model';
import { WarehouseListResponse } from '../../../../../modules/warehouse/get/models/warehouse-list-response.model';
import { ErrorResponse } from '../../../../../core/models/error-response.model';
import { Detail } from '../../../../../modules/quotation/get/models/quotation-preview.model';

@Component({
  selector: 'app-quotation-create',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './quotation-create.html',
  styleUrl: './quotation-create.css'
})
export class QuotationCreate implements OnInit, OnDestroy {
  private readonly quotationCartService = inject(QuotationCartService);
  private readonly quotationService = inject(QuotationService);
  private readonly customerService = inject(CustomerService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly router = inject(Router);

  readonly cart = this.quotationCartService.cart;
  readonly details = this.quotationCartService.details;
  readonly total = this.quotationCartService.total;
  readonly itemCount = this.quotationCartService.itemCount;

  readonly customers = signal<CustomerListResponse[]>([]);
  readonly warehouses = signal<WarehouseListResponse[]>([]);

  readonly showCustomerDropdown = signal(false);
  readonly customerSearch = signal('');

  readonly showWarehouseDropdown = signal(false);
  readonly warehouseSearch = signal('');

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

  notesModel = signal('');

  readonly missingData = computed(() => ({
    customer: this.cart().customer.id === 0,
    warehouse: this.cart().warehouse.id === 0
  }));

  readonly hasWarnings = computed(() => {
    const m = this.missingData();
    return m.customer || m.warehouse;
  });

  readonly warningMessage = computed(() => {
    const m = this.missingData();
    const warns: string[] = [];
    if (m.customer) warns.push('cliente');
    if (m.warehouse) warns.push('almacén');
    return warns.length ? `Falta seleccionar: ${warns.join(', ')}. Puedes agregar productos y completar estos datos después.` : '';
  });

  readonly canSave = computed(() =>
    this.itemCount() > 0 &&
    this.cart().customer.id > 0 &&
    this.cart().warehouse.id > 0
  );

  readonly saveBlockReason = computed(() => {
    if (this.itemCount() === 0) return 'Agrega al menos un producto';
    if (this.cart().customer.id === 0) return 'Selecciona un cliente';
    if (this.cart().warehouse.id === 0) return 'Selecciona un almacén';
    return '';
  });

  private keyboardListener?: (e: KeyboardEvent) => void;
  private clickListener?: () => void;
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    effect(() => {
      this.notesModel.set(this.cart().notes);
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
      if (cart.customer.id === 0 || cart.warehouse.id === 0) {
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
    this.quotationCartService.initialize({
      customer: { id: 0, name: '', address: '', taxId: '', phone: '' },
      warehouse: { id: 0, code: '', name: '', address: '' },
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
  }

  toggleCustomerDropdown(event: Event): void {
    event.stopPropagation();
    this.showCustomerDropdown.update(v => !v);
    this.customerSearch.set('');
  }

  selectCustomerFromDropdown(customer: CustomerListResponse, event: Event): void {
    event.stopPropagation();
    this.quotationCartService.updateCustomer({
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
    this.quotationCartService.updateWarehouse({
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address
    });
    this.showWarehouseDropdown.set(false);
    this.warehouseSearch.set('');
  }

  updateDetailQuantity(productId: number, value: number): void {
    const quantity = Math.max(1, value);
    this.quotationCartService.updateDetail(productId, { quantity });
  }

  updateDetailPrice(productId: number, value: number): void {
    const price = Math.max(0, value);
    this.quotationCartService.updateDetail(productId, { price });
  }

  updateDetailName(productId: number, value: string): void {
    this.quotationCartService.updateDetail(productId, { editableName: value });
  }

  updateDetailNotes(productId: number, value: string): void {
    this.quotationCartService.updateDetail(productId, { notes: value });
  }

  removeDetail(productId: number): void {
    if (confirm('¿Eliminar este producto?')) {
      this.quotationCartService.removeDetail(productId);
    }
  }

  updateQuotationNotes(notes: string): void {
    this.quotationCartService.updateNotes(notes);
  }

  clearAll(): void {
    if (this.itemCount() === 0) {
      alert('No hay nada que limpiar');
      return;
    }

    const message = this.itemCount() > 0
      ? `¿Seguro que deseas limpiar toda la cotización? Se eliminarán ${this.itemCount()} producto(s).`
      : '¿Seguro que deseas limpiar toda la cotización?';

    if (confirm(message)) {
      this.quotationCartService.clear();
      this.initializeCart();
      this.notesModel.set('');
      alert('Cotización limpiada completamente');
    }
  }

  createQuotation(): void {
    if (!this.canSave()) {
      alert(this.saveBlockReason());
      return;
    }

    const invalidDetails = this.details().filter(d => d.quantity <= 0 || d.price < 0);
    if (invalidDetails.length > 0) {
      alert('Todos los productos deben tener cantidad > 0 y precio >= 0');
      return;
    }

    const request = this.quotationCartService.toApiRequest();
    console.log('Request:', JSON.stringify(request, null, 2));

    this.quotationService.createQuotation(request).subscribe({
      next: (response) => {
        console.log('Response:', JSON.stringify(response, null, 2));

        if (response.success && response.data) {
          this.quotationCartService.saveCurrentQuotation(response.data);
          alert(`Cotización ${response.data.number} creada exitosamente`);
          this.quotationCartService.clear();
          this.initializeCart();
          this.notesModel.set('');
        }
      },
      error: (err: ErrorResponse) => {
        console.error('Error:', err);
        alert(this.errorHandler.handleError(err, 'Error al crear cotización'));
      }
    });
  }

  previewQuotation(): void {
    if (this.itemCount() === 0) {
      alert('Agrega al menos un producto para previsualizar');
      return;
    }

    if (this.hasWarnings()) {
      const proceed = confirm(`${this.warningMessage()}\n\n¿Deseas continuar con la previsualización?`);
      if (!proceed) return;
    }

    window.open('/quotation/print?mode=preview', '_blank');
  }

  viewLastQuotation(): void {
    const last = this.quotationCartService.getCurrentQuotation();
    if (!last) {
      alert('No hay ninguna cotización generada aún');
      return;
    }
    window.open('/quotation/print?mode=current', '_blank');
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
            this.router.navigate(['/quotation/select-product']);
            break;
          case 'S':
            e.preventDefault();
            if (this.canSave()) {
              this.createQuotation();
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
      this.quotationCartService.updateWarehouse({
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
      this.quotationCartService.updateCustomer({
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

  trackByProductId(_: number, detail: Detail): number {
    return detail.productId;
  }

  trackByCustomerId(_: number, customer: CustomerListResponse): number {
    return customer.id;
  }

  trackByWarehouseId(_: number, warehouse: WarehouseListResponse): number {
    return warehouse.id;
  }
}