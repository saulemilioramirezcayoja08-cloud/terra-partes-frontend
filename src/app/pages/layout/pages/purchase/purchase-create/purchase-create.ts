import {Component, computed, effect, inject, OnDestroy, OnInit, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, DecimalPipe, isPlatformBrowser} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PurchaseCartService} from '../../../../../modules/purchase/services/purchase-cart-service';
import {PurchaseService} from '../../../../../modules/purchase/services/purchase.service';
import {SupplierService} from '../../../../../modules/supplier/services/supplier.service';
import {WarehouseService} from '../../../../../modules/warehouse/services/warehouse.service';
import {ErrorHandlerService} from '../../../../../core/services/error-handler.service';
import {Router} from '@angular/router';
import {SupplierListResponse} from '../../../../../modules/supplier/get/models/supplier-list-response.model';
import {WarehouseListResponse} from '../../../../../modules/warehouse/get/models/warehouse-list-response.model';
import {ErrorResponse} from '../../../../../core/models/error-response.model';
import {Detail, Payment} from '../../../../../modules/order/get/models/order-preview.model';
import {PaymentService} from '../../../../../modules/payment/services/payment.service';
import {PaymentListResponse} from '../../../../../modules/payment/get/models/payment-list-response.model';

@Component({
  selector: 'app-purchase-create',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './purchase-create.html',
  styleUrl: './purchase-create.css'
})
export class PurchaseCreate implements OnInit, OnDestroy {
  private readonly purchaseCartService = inject(PurchaseCartService);
  private readonly purchaseService = inject(PurchaseService);
  private readonly supplierService = inject(SupplierService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly paymentService = inject(PaymentService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly router = inject(Router);

  readonly cart = this.purchaseCartService.cart;
  readonly details = this.purchaseCartService.details;
  readonly total = this.purchaseCartService.total;
  readonly itemCount = this.purchaseCartService.itemCount;

  readonly suppliers = signal<SupplierListResponse[]>([]);
  readonly warehouses = signal<WarehouseListResponse[]>([]);
  readonly payments = signal<PaymentListResponse[]>([]);

  notesModel = signal('');

  readonly missingData = computed(() => ({
    supplier: this.cart().supplier.id === 0,
    warehouse: this.cart().warehouse.id === 0,
    payment: !this.cart().payment || this.cart().payment.id === 0
  }));

  readonly hasWarnings = computed(() => {
    const m = this.missingData();
    return m.supplier || m.warehouse || m.payment;
  });

  readonly warningMessage = computed(() => {
    const m = this.missingData();
    const warns: string[] = [];
    if (m.supplier) warns.push('proveedor');
    if (m.warehouse) warns.push('almacén');
    if (m.payment) warns.push('método de pago');
    return warns.length ? `Falta seleccionar: ${warns.join(', ')}. Puedes agregar productos y completar estos datos después.` : '';
  });

  readonly canSave = computed(() =>
    this.itemCount() > 0 &&
    this.cart().supplier.id > 0 &&
    this.cart().warehouse.id > 0 &&
    !!this.cart().payment && this.cart().payment.id > 0
  );

  readonly saveBlockReason = computed(() => {
    if (this.itemCount() === 0) return 'Agrega al menos un producto';
    if (this.cart().supplier.id === 0) return 'Selecciona un proveedor';
    if (this.cart().warehouse.id === 0) return 'Selecciona un almacén';
    if (!this.cart().payment || this.cart().payment.id === 0) return 'Selecciona un método de pago';
    return '';
  });

  private keyboardListener?: (e: KeyboardEvent) => void;
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
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.keyboardListener) {
      document.removeEventListener('keydown', this.keyboardListener);
    }
  }

  private ensureCartReady(): void {
    const cart = this.cart();

    if (!cart.currency) {
      this.initializeCart();
      return;
    }

    if (this.itemCount() > 0) {
      if (cart.supplier.id === 0 || cart.warehouse.id === 0 || !cart.payment || cart.payment.id === 0) {
        console.warn('Hay productos pero faltan datos maestros');
      }
      return;
    }

    if (cart.supplier.id === 0 || cart.warehouse.id === 0 || !cart.payment || cart.payment.id === 0) {
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
    this.purchaseCartService.initialize({
      supplier: { id: 0, name: '', address: '', taxId: '', phone: '' },
      warehouse: { id: 0, code: '', name: '', address: '' },
      currency: 'BOB',
      payment: { id: 0, code: '', name: '' } as Payment
    });
  }

  private loadMasterData(): void {
    this.supplierService.getSuppliers({ size: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.suppliers.set(response.data.content);
        }
      },
      error: (err: ErrorResponse) => {
        console.error(this.errorHandler.handleError(err, 'Error al cargar proveedores'));
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

  updateDetailQuantity(productId: number, value: number): void {
    const quantity = Math.max(1, value);
    this.purchaseCartService.updateDetail(productId, { quantity });
  }

  updateDetailPrice(productId: number, value: number): void {
    const price = Math.max(0, value);
    this.purchaseCartService.updateDetail(productId, { price });
  }

  updateDetailName(productId: number, value: string): void {
    this.purchaseCartService.updateDetail(productId, { editableName: value });
  }

  updateDetailNotes(productId: number, value: string): void {
    this.purchaseCartService.updateDetail(productId, { notes: value });
  }

  removeDetail(productId: number): void {
    if (confirm('¿Eliminar este producto?')) {
      this.purchaseCartService.removeDetail(productId);
    }
  }

  updatePurchaseNotes(notes: string): void {
    this.purchaseCartService.updateNotes(notes);
  }

  clearAll(): void {
    if (this.itemCount() === 0) {
      alert('No hay nada que limpiar');
      return;
    }

    const message = this.itemCount() > 0
      ? `¿Seguro que deseas limpiar toda la compra? Se eliminarán ${this.itemCount()} producto(s).`
      : '¿Seguro que deseas limpiar toda la compra?';

    if (confirm(message)) {
      this.purchaseCartService.clear();
      this.initializeCart();
      this.notesModel.set('');
      alert('Compra limpiada completamente');
    }
  }

  createPurchase(): void {
    if (!this.canSave()) {
      alert(this.saveBlockReason());
      return;
    }

    const invalidDetails = this.details().filter(d => d.quantity <= 0 || d.price < 0);
    if (invalidDetails.length > 0) {
      alert('Todos los productos deben tener cantidad > 0 y precio >= 0');
      return;
    }

    if (!this.cart().payment || this.cart().payment.id === 0) {
      alert('Selecciona un método de pago válido');
      return;
    }

    const request = this.purchaseCartService.toApiRequest();
    console.log('Request:', JSON.stringify(request, null, 2));

    this.purchaseService.createPurchase(request).subscribe({
      next: (response) => {
        console.log('Response:', JSON.stringify(response, null, 2));

        if (response.success && response.data) {
          this.purchaseCartService.saveCurrentPurchase(response.data);
          alert(`Compra ${response.data.number} creada exitosamente`);
          this.purchaseCartService.clear();
          this.initializeCart();
          this.notesModel.set('');
        }
      },
      error: (err: ErrorResponse) => {
        console.error('Error:', err);
        alert(this.errorHandler.handleError(err, 'Error al crear compra'));
      }
    });
  }

  previewPurchase(): void {
    if (this.itemCount() === 0) {
      alert('Agrega al menos un producto para previsualizar');
      return;
    }

    if (this.hasWarnings()) {
      const proceed = confirm(`${this.warningMessage()}\n\n¿Deseas continuar con la previsualización?`);
      if (!proceed) return;
    }

    window.open('/purchase/print?mode=preview', '_blank');
  }

  viewLastPurchase(): void {
    const last = this.purchaseCartService.getCurrentPurchase();
    if (!last) {
      alert('No hay ninguna compra generada aún');
      return;
    }
    window.open('/purchase/print?mode=current', '_blank');
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
            this.router.navigate(['/purchase/select-product']);
            break;
          case 'S':
            e.preventDefault();
            if (this.canSave()) {
              this.createPurchase();
            } else {
              alert(this.saveBlockReason());
            }
            break;
          case 'U':
            e.preventDefault();
            this.selectSupplier();
            break;
          case 'A':
            e.preventDefault();
            this.selectWarehouse();
            break;
          case 'M':
            e.preventDefault();
            this.selectPayment();
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

    const warehouse = this.warehouses().find(w => w.id === parseInt(id, 10));
    if (warehouse) {
      this.purchaseCartService.updateWarehouse({
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

  private selectSupplier(): void {
    if (this.suppliers().length === 0) {
      alert('Cargando proveedores... Intenta nuevamente en un momento.');
      return;
    }

    const id = prompt('Ingresa el ID del proveedor:');
    if (!id) return;

    const supplier = this.suppliers().find(s => s.id === parseInt(id, 10));
    if (supplier) {
      this.purchaseCartService.updateSupplier({
        id: supplier.id,
        name: supplier.name,
        address: supplier.address,
        taxId: supplier.taxId,
        phone: supplier.phone
      });
      alert(`Proveedor actualizado: ${supplier.name}`);
    } else {
      alert('Proveedor no encontrado. Verifica el ID.');
    }
  }

  private selectPayment(): void {
    if (this.payments().length === 0) {
      alert('Cargando métodos de pago... Intenta nuevamente en un momento.');
      return;
    }

    const id = prompt('Ingresa el ID del método de pago:');
    if (!id) return;

    const payment = this.payments().find(p => p.id === parseInt(id, 10));
    if (payment) {
      this.purchaseCartService.updatePaymentMethod({
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
}
