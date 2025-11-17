import {computed, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {AuthService} from '../../auth/services/auth.service';
import {isPlatformBrowser} from '@angular/common';
import {Customer, Detail, QuotationPreview, Totals, User, Warehouse} from '../get/models/quotation-preview.model';
import {CreateQuotationRequest} from '../post/models/create-quotation-request.model';
import {CreateQuotationResponse} from '../post/models/create-quotation-response.model';

const STORAGE_KEY = 'quotation_preview';
const CURRENT_QUOTATION_KEY = 'quotation_current';

@Injectable({
  providedIn: 'root'
})
export class QuotationCartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _cart = signal<QuotationPreview>(this.loadFromStorage());

  readonly cart = this._cart.asReadonly();
  readonly details = computed(() => this._cart().details);
  readonly itemCount = computed(() => this._cart().totals.items);
  readonly total = computed(() => this._cart().totals.total);
  readonly productIds = computed(() => new Set(this._cart().details.map(d => d.productId)));

  initialize(config: {
    customer: Customer;
    warehouse: Warehouse;
    currency: string;
  }): void {
    const user = this.authService.currentUser;
    this._cart.set({
      status: 'BORRADOR',
      currency: config.currency,
      notes: '',
      customer: config.customer,
      warehouse: config.warehouse,
      user: {
        id: user?.id || 0,
        username: user?.username || '',
        email: user?.email || '',
        name: user?.name || ''
      } as User,
      details: [],
      totals: {
        total: 0,
        items: 0
      } as Totals
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

  updateUser(user: User): void {
    this._cart.update(cart => ({...cart, user}));
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
        totals: this.calculateTotals(newDetails)
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
        totals: this.calculateTotals(newDetails)
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
        totals: this.calculateTotals(newDetails)
      };
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

  toApiRequest(): CreateQuotationRequest {
    const cart = this._cart();
    const request: CreateQuotationRequest = {
      customerId: cart.customer.id,
      warehouseId: cart.warehouse.id,
      userId: cart.user.id,
      currency: cart.currency,
      notes: cart.notes || undefined,
      details: cart.details.map(d => ({
        productId: d.productId,
        quantity: d.quantity,
        price: d.price,
        notes: d.notes || undefined
      }))
    };

    console.log('QUOTATION JSON TO API:', JSON.stringify(request, null, 2));
    return request;
  }

  saveCurrentQuotation(resp: CreateQuotationResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(CURRENT_QUOTATION_KEY, JSON.stringify(resp));
    }
  }

  getCurrentQuotation(): CreateQuotationResponse | null {
    if (!this.isBrowser) return null;
    const stored = localStorage.getItem(CURRENT_QUOTATION_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  getPreviewForPrint(): QuotationPreview {
    return this._cart();
  }

  private calculateTotals(details: Detail[]): Totals {
    const total = details.reduce((sum, d) => sum + d.subtotal, 0);
    return {
      total,
      items: details.length
    };
  }

  private loadFromStorage(): QuotationPreview {
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
      console.log('QUOTATION PREVIEW:', JSON.stringify(preview, null, 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preview));
    }
  }

  private getEmptyCart(): QuotationPreview {
    return {
      status: 'BORRADOR',
      currency: '',
      notes: '',
      customer: {id: 0, name: '', address: '', taxId: '', phone: ''},
      warehouse: {id: 0, code: '', name: '', address: ''},
      user: {id: 0, username: '', email: '', name: ''},
      details: [],
      totals: {total: 0, items: 0}
    };
  }
}