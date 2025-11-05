import {computed, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {AuthService} from '../../auth/services/auth.service';
import {isPlatformBrowser} from '@angular/common';
import {Customer, Detail, OrderPreview, Payment, Totals, Warehouse} from '../get/models/order-preview.model';
import {CreateOrderRequest} from '../post/models/create-order-request.model';
import {CreateOrderResponse} from '../post/models/create-order-response.model';

const STORAGE_KEY = 'order_preview';
const CURRENT_ORDER_KEY = 'order_current';

@Injectable({
  providedIn: 'root'
})
export class OrderCartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _cart = signal<OrderPreview>(this.loadFromStorage());

  readonly cart = this._cart.asReadonly();
  readonly details = computed(() => this._cart().details);
  readonly itemCount = computed(() => this._cart().totals.items);
  readonly total = computed(() => this._cart().totals.total);
  readonly totalPayments = computed(() => this._cart().totals.payment);
  readonly pending = computed(() => this._cart().totals.pending);
  readonly productIds = computed(() =>
    new Set(this._cart().details.map(d => d.productId))
  );

  initialize(config: {
    customer: Customer;
    warehouse: Warehouse;
    payment: Payment;
    currency: string;
  }): void {
    const user = this.authService.currentUser;
    this._cart.set({
      status: 'BORRADOR',
      currency: config.currency,
      notes: '',
      customer: config.customer,
      warehouse: config.warehouse,
      payment: config.payment,
      user: {
        id: user?.id || 1,
        username: user?.username || 'system',
        email: user?.email || 'system@system.com',
        name: user?.name || 'System User'
      },
      details: [],
      totals: {
        total: 0,
        payment: 0,
        pending: 0,
        items: 0
      }
    });
    this.saveToStorage();
  }

  updateCustomer(customer: Customer): void {
    this._cart.update(cart => ({...cart, customer}));
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
      return {
        ...cart,
        details: newDetails,
        totals: this.calculateTotals(newDetails, cart.totals.payment)
      };
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
            subtotal: (updates.quantity ?? d.quantity) * (updates.price ?? d.price)
          }
          : d
      );
      return {
        ...cart,
        details: newDetails,
        totals: this.calculateTotals(newDetails, cart.totals.payment)
      };
    });
    this.saveToStorage();
  }

  removeDetail(productId: number): void {
    this._cart.update(cart => {
      const newDetails = cart.details.filter(d => d.productId !== productId);
      return {
        ...cart,
        details: newDetails,
        totals: this.calculateTotals(newDetails, cart.totals.payment)
      };
    });
    this.saveToStorage();
  }

  updatePaymentAmount(amount: number): void {
    this._cart.update(cart => ({
      ...cart,
      totals: {
        ...cart.totals,
        payment: amount,
        pending: cart.totals.total - amount
      }
    }));
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

  toApiRequest(): CreateOrderRequest {
    const cart = this._cart();
    const request: CreateOrderRequest = {
      customerId: cart.customer.id,
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
      })),
      payment: cart.totals.payment > 0
        ? {amount: cart.totals.payment}
        : undefined
    };

    console.log('JSON TO API:', JSON.stringify(request, null, 2));

    return request;
  }

  saveCurrentOrder(order: CreateOrderResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(order));
    }
  }

  getCurrentOrder(): CreateOrderResponse | null {
    if (!this.isBrowser) return null;
    const stored = localStorage.getItem(CURRENT_ORDER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  getPreviewForPrint(): OrderPreview {
    return this._cart();
  }

  private calculateTotals(details: Detail[], paymentAmount: number): Totals {
    const total = details.reduce((sum, d) => sum + d.subtotal, 0);
    return {
      total,
      payment: paymentAmount,
      pending: total - paymentAmount,
      items: details.length
    };
  }

  private loadFromStorage(): OrderPreview {
    if (!this.isBrowser) return this.getEmptyCart();

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.getEmptyCart();
      }
    }
    return this.getEmptyCart();
  }

  private saveToStorage(): void {
    if (this.isBrowser) {
      const preview = this._cart();
      console.log('ORDER PREVIEW:', JSON.stringify(preview, null, 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preview));
    }
  }

  private getEmptyCart(): OrderPreview {
    return {
      status: 'BORRADOR',
      currency: '',
      notes: '',
      customer: {id: 0, name: '', address: '', taxId: '', phone: ''},
      warehouse: {id: 0, code: '', name: '', address: ''},
      payment: {id: 0, code: '', name: ''},
      user: {id: 0, username: '', email: '', name: ''},
      details: [],
      totals: {total: 0, payment: 0, pending: 0, items: 0}
    };
  }
}
