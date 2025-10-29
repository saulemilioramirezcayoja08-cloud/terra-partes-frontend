import {computed, effect, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {ProductListResponse} from '../../catalog/models/product-list-response.model';
import {isPlatformBrowser} from '@angular/common';

export interface OrderCartItem {
  productId: number;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderCartService {
  private readonly ORDER_DETAILS_KEY = 'order_details';
  private readonly ORDER_PAYMENTS_KEY = 'order_payments';
  private readonly ORDER_NOTES_KEY = 'order_notes';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private items = signal<OrderCartItem[]>(this.loadFromStorage());
  private advancePayment = signal<number>(this.loadAdvanceFromStorage());
  private orderNotes = signal<string>(this.loadNotesFromStorage());

  public cartItems = this.items.asReadonly();
  public advance = this.advancePayment.asReadonly();
  public notes = this.orderNotes.asReadonly();

  public total = computed(() =>
    this.items().reduce((sum, item) => sum + item.subtotal, 0)
  );

  public pendingAmount = computed(() => {
    const totalAmount = this.total();
    const advanceAmount = this.advancePayment();
    return totalAmount - advanceAmount;
  });

  public itemCount = computed(() => this.items().length);

  constructor() {
    effect(() => {
      const currentItems = this.items();
      this.saveToStorage(currentItems);
    });

    effect(() => {
      const currentAdvance = this.advancePayment();
      this.saveAdvanceToStorage(currentAdvance);
    });

    effect(() => {
      const currentNotes = this.orderNotes();
      this.saveNotesToStorage(currentNotes);
    });
  }

  private loadFromStorage(): OrderCartItem[] {
    if (!this.isBrowser) return [];

    try {
      const saved = localStorage.getItem(this.ORDER_DETAILS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    }
    return [];
  }

  private saveToStorage(items: OrderCartItem[]): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.ORDER_DETAILS_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  }

  private loadAdvanceFromStorage(): number {
    if (!this.isBrowser) return 0;

    try {
      const saved = localStorage.getItem(this.ORDER_PAYMENTS_KEY);
      if (saved) {
        return parseFloat(saved);
      }
    } catch (error) {
      console.error('Error al cargar anticipo:', error);
    }
    return 0;
  }

  private saveAdvanceToStorage(amount: number): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.ORDER_PAYMENTS_KEY, amount.toString());
    } catch (error) {
      console.error('Error al guardar anticipo:', error);
    }
  }

  private loadNotesFromStorage(): string {
    if (!this.isBrowser) return '';

    try {
      const saved = localStorage.getItem(this.ORDER_NOTES_KEY);
      if (saved) {
        return saved;
      }
    } catch (error) {
      console.error('Error al cargar observaciones:', error);
    }
    return '';
  }

  private saveNotesToStorage(notes: string): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.ORDER_NOTES_KEY, notes);
    } catch (error) {
      console.error('Error al guardar observaciones:', error);
    }
  }

  addProduct(product: ProductListResponse): void {
    const newItem: OrderCartItem = {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      quantity: 1,
      price: product.price,
      subtotal: product.price,
      notes: ''
    };

    this.items.update(currentItems => [...currentItems, newItem]);
  }

  updateItem(index: number, changes: Partial<OrderCartItem>): void {
    this.items.update(currentItems => {
      const updated = [...currentItems];
      updated[index] = {
        ...updated[index],
        ...changes
      };

      if (changes.quantity !== undefined || changes.price !== undefined) {
        updated[index].subtotal = updated[index].quantity * updated[index].price;
      }

      return updated;
    });
  }

  removeItem(index: number): void {
    this.items.update(currentItems => currentItems.filter((_, i) => i !== index));
  }

  setAdvance(amount: number): void {
    const validAmount = Math.max(0, amount);
    this.advancePayment.set(validAmount);
  }

  setNotes(notes: string): void {
    this.orderNotes.set(notes);
  }

  clear(): void {
    this.items.set([]);
    this.advancePayment.set(0);
    this.orderNotes.set('');

    if (this.isBrowser) {
      localStorage.removeItem(this.ORDER_DETAILS_KEY);
      localStorage.removeItem(this.ORDER_PAYMENTS_KEY);
      localStorage.removeItem(this.ORDER_NOTES_KEY);
    }
  }

  isEmpty(): boolean {
    return this.items().length === 0;
  }

  getOrderDetails(): { productId: number, quantity: number, price: number, notes?: string }[] {
    return this.items().map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes || undefined
    }));
  }
}
