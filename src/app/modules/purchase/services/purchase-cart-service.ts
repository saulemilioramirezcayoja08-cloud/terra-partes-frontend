import {computed, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {AuthService} from '../../auth/services/auth.service';
import {isPlatformBrowser} from '@angular/common';
import {
  Detail,
  Payment,
  PurchasePreview,
  Supplier,
  Totals,
  User,
  Warehouse
} from '../get/models/purchase-preview.model';
import {CreatePurchaseRequest} from '../post/models/create-purchase-request.model';
import {CreatePurchaseResponse} from '../post/models/create-purchase-response.model';

const STORAGE_KEY = 'purchase_preview';
const CURRENT_PURCHASE_KEY = 'purchase_current';

@Injectable({
  providedIn: 'root'
})
export class PurchaseCartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _cart = signal<PurchasePreview>(this.loadFromStorage());

  readonly cart = this._cart.asReadonly();
  readonly details = computed(() => this._cart().details);
  readonly itemCount = computed(() => this._cart().totals.items);
  readonly total = computed(() => this._cart().totals.total);
  readonly productIds = computed(() => new Set(this._cart().details.map(d => d.productId)));
  readonly payment = computed(() => this._cart().payment);

  initialize(config: {
    supplier: Supplier;
    warehouse: Warehouse;
    currency: string;
    payment: Payment;
  }): void {
    const user = this.authService.currentUser;
    this._cart.set({
      status: 'BORRADOR',
      currency: config.currency,
      notes: '',
      supplier: config.supplier,
      warehouse: config.warehouse,
      payment: config.payment,
      user: {
        id: user?.id || 1,
        username: user?.username || 'system',
        email: user?.email || 'system@system.com',
        name: user?.name || 'System User'
      } as User,
      details: [],
      totals: {total: 0, items: 0} as Totals
    });
    this.saveToStorage();
  }

  updateSupplier(supplier: Supplier): void {
    this._cart.update(cart => ({...cart, supplier}));
    this.saveToStorage();
  }

  updateWarehouse(warehouse: Warehouse): void {
    this._cart.update(cart => ({...cart, warehouse}));
    this.saveToStorage();
  }

  updatePaymentMethod(payment: Payment): void {
    this._cart.update(cart => ({...cart, payment}));
    this.saveToStorage();
  }

  addDetail(detail: Detail): void {
    const exists = this._cart().details.find(d => d.productId === detail.productId);
    if (exists) return;

    this._cart.update(cart => {
      const newDetails = [...cart.details, detail];
      return {...cart, details: newDetails, totals: this.calculateTotals(newDetails)};
    });
    this.saveToStorage();
  }

  updateDetail(productId: number, updates: Partial<Detail>): void {
    this._cart.update(cart => {
      const newDetails = cart.details.map(d =>
        d.productId === productId
          ? {
            ...d,
            ...updates,
            subtotal:
              (((updates.quantity ?? d.quantity) as number) || 0) *
              (((updates.price ?? d.price) as number) || 0)
          }
          : d
      );
      return {...cart, details: newDetails, totals: this.calculateTotals(newDetails)};
    });
    this.saveToStorage();
  }

  removeDetail(productId: number): void {
    this._cart.update(cart => {
      const newDetails = cart.details.filter(d => d.productId !== productId);
      return {...cart, details: newDetails, totals: this.calculateTotals(newDetails)};
    });
    this.saveToStorage();
  }

  updateNotes(notes: string): void {
    this._cart.update(cart => ({...cart, notes}));
    this.saveToStorage();
  }

  clear(): void {
    this._cart.set(this.getEmptyCart());
    this.saveToStorage();
  }

  toApiRequest(): CreatePurchaseRequest {
    const cart = this._cart();


    if (!cart.payment || !cart.payment.id) {
      throw new Error('PAYMENT_REQUIRED');
    }
    if (!cart.supplier?.id) throw new Error('SUPPLIER_REQUIRED');
    if (!cart.warehouse?.id) throw new Error('WAREHOUSE_REQUIRED');
    if (!cart.user?.id) throw new Error('USER_REQUIRED');
    if (!cart.details.length) throw new Error('DETAILS_REQUIRED');

    const request: CreatePurchaseRequest = {
      supplierId: cart.supplier.id,
      warehouseId: cart.warehouse.id,
      userId: cart.user.id,
      paymentId: cart.payment.id,
      currency: cart.currency,
      notes: cart.notes || undefined,
      details: cart.details.map(d => ({
        productId: d.productId,
        quantity: d.quantity,
        price: d.price,
        notes: d.notes || undefined
      }))
    };

    console.log('PURCHASE JSON TO API:', JSON.stringify(request, null, 2));
    return request;
  }

  saveCurrentPurchase(resp: CreatePurchaseResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(CURRENT_PURCHASE_KEY, JSON.stringify(resp));
    }
  }

  getCurrentPurchase(): CreatePurchaseResponse | null {
    if (!this.isBrowser) return null;
    const stored = localStorage.getItem(CURRENT_PURCHASE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  getPreviewForPrint(): PurchasePreview {
    return this._cart();
  }

  private calculateTotals(details: Detail[]): Totals {
    const total = details.reduce((sum, d) => sum + d.subtotal, 0);
    return {total, items: details.length};
  }

  private loadFromStorage(): PurchasePreview {
    if (!this.isBrowser) return this.getEmptyCart();

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return this.getEmptyCart();

    try {
      const parsed: PurchasePreview = JSON.parse(stored);
      if (!('payment' in parsed) || !parsed.payment) {
        (parsed as any).payment = {id: 0, code: '', name: ''} as Payment;
      }
      return parsed;
    } catch {
      return this.getEmptyCart();
    }
  }

  private saveToStorage(): void {
    if (this.isBrowser) {
      const preview = this._cart();
      console.log('PURCHASE PREVIEW:', JSON.stringify(preview, null, 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preview));
    }
  }

  private getEmptyCart(): PurchasePreview {
    return {
      status: 'BORRADOR',
      currency: '',
      notes: '',
      supplier: {id: 0, name: '', address: '', taxId: '', phone: ''},
      warehouse: {id: 0, code: '', name: '', address: ''},
      payment: {id: 0, code: '', name: ''},
      user: {id: 0, username: '', email: '', name: ''},
      details: [],
      totals: {total: 0, items: 0}
    };
  }
}
