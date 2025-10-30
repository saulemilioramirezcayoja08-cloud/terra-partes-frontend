import {computed, effect, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {
  CustomerPreview,
  DEFAULT_CURRENCY,
  DEFAULT_CUSTOMER,
  DEFAULT_PAYMENT,
  DEFAULT_WAREHOUSE, DetailPreview,
  OrderPreview, PaymentMethodPreview, WarehousePreview
} from '../models/order-preview.model';
import {CreateOrderRequest, DetailRequest, PaymentRequest} from '../models/create-order-request.model';
import {ProductListResponse} from '../../catalog/models/product-list-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrderCartService {
  private readonly ORDER_PREVIEW_KEY = 'order_preview';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private orderPreview = signal<OrderPreview>(this.loadFromStorage());

  public preview = this.orderPreview.asReadonly();

  public customer = computed(() => this.orderPreview().customer);
  public warehouse = computed(() => this.orderPreview().warehouse);
  public paymentMethod = computed(() => this.orderPreview().paymentMethod);
  public currency = computed(() => this.orderPreview().currency);
  public notes = computed(() => this.orderPreview().notes);
  public details = computed(() => this.orderPreview().details);
  public payments = computed(() => this.orderPreview().payments);

  public total = computed(() =>
    this.orderPreview().details.reduce((sum, item) => sum + item.subtotal, 0)
  );

  public advance = computed(() =>
    this.orderPreview().payments.reduce((sum, payment) => sum + payment.amount, 0)
  );

  public pendingAmount = computed(() => this.total() - this.advance());

  public itemCount = computed(() => this.orderPreview().details.length);

  constructor() {
    effect(() => {
      const currentPreview = this.orderPreview();
      this.saveToStorage(currentPreview);
    });
  }

  private loadFromStorage(): OrderPreview {
    if (!this.isBrowser) return this.createDefaultPreview();

    try {
      const saved = localStorage.getItem(this.ORDER_PREVIEW_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error al cargar preview:', error);
    }
    return this.createDefaultPreview();
  }

  private saveToStorage(preview: OrderPreview): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.ORDER_PREVIEW_KEY, JSON.stringify(preview));
    } catch (error) {
      console.error('Error al guardar preview:', error);
    }
  }

  private createDefaultPreview(): OrderPreview {
    return {
      customer: DEFAULT_CUSTOMER,
      warehouse: DEFAULT_WAREHOUSE,
      paymentMethod: DEFAULT_PAYMENT,
      currency: DEFAULT_CURRENCY,
      notes: '',
      details: [],
      payments: []
    };
  }

  setCustomer(customer: CustomerPreview): void {
    this.orderPreview.update(prev => ({...prev, customer}));
  }

  setWarehouse(warehouse: WarehousePreview): void {
    this.orderPreview.update(prev => ({...prev, warehouse}));
  }

  setPaymentMethod(paymentMethod: PaymentMethodPreview): void {
    this.orderPreview.update(prev => ({...prev, paymentMethod}));
  }

  setNotes(notes: string): void {
    this.orderPreview.update(prev => ({...prev, notes}));
  }

  addProduct(product: ProductListResponse): void {
    const newDetail: DetailPreview = {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      quantity: 1,
      price: product.price,
      subtotal: product.price,
      notes: ''
    };

    this.orderPreview.update(prev => ({
      ...prev,
      details: [...prev.details, newDetail]
    }));
  }

  updateDetail(index: number, changes: Partial<DetailPreview>): void {
    this.orderPreview.update(prev => {
      const updatedDetails = [...prev.details];
      updatedDetails[index] = {
        ...updatedDetails[index],
        ...changes
      };

      if (changes.quantity !== undefined || changes.price !== undefined) {
        updatedDetails[index].subtotal = updatedDetails[index].quantity * updatedDetails[index].price;
      }

      return {...prev, details: updatedDetails};
    });
  }

  removeDetail(index: number): void {
    this.orderPreview.update(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  }

  setAdvance(amount: number, userId?: number): void {
    const validAmount = Math.max(0, amount);

    if (validAmount === 0) {
      this.orderPreview.update(prev => ({...prev, payments: []}));
    } else {
      this.orderPreview.update(prev => ({
        ...prev,
        payments: [{amount: validAmount, userId}]
      }));
    }
  }

  clear(): void {
    this.orderPreview.set(this.createDefaultPreview());

    if (this.isBrowser) {
      localStorage.removeItem(this.ORDER_PREVIEW_KEY);
    }
  }

  isEmpty(): boolean {
    return this.orderPreview().details.length === 0;
  }

  toCreateOrderRequest(userId?: number): CreateOrderRequest {
    const preview = this.orderPreview();

    const details: DetailRequest[] = preview.details.map(detail => ({
      productId: detail.productId,
      quantity: detail.quantity,
      price: detail.price,
      notes: detail.notes || undefined
    }));

    const payments: PaymentRequest[] | undefined = preview.payments.length > 0
      ? preview.payments.map(p => ({
        amount: p.amount,
        userId: p.userId || userId
      }))
      : undefined;

    return {
      customerId: preview.customer.id,
      warehouseId: preview.warehouse.id,
      paymentId: preview.paymentMethod.id,
      currency: preview.currency,
      notes: preview.notes || undefined,
      userId: userId,
      details: details,
      payments: payments
    };
  }
}
