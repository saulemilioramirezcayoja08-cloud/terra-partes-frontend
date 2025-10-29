import {Component, HostListener, inject} from '@angular/core';
import {Router} from '@angular/router';
import {OrderCartService} from '../../../../../modules/orders/services/order-cart-service';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-order-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-create.html',
  styleUrl: './order-create.css'
})
export class OrderCreate {
  private router = inject(Router);
  private orderCartService = inject(OrderCartService);

  cartItems = this.orderCartService.cartItems;
  orderTotal = this.orderCartService.total;
  advanceAmount = this.orderCartService.advance;
  pendingAmount = this.orderCartService.pendingAmount;
  orderNotes = this.orderCartService.notes;

  updateAdvance(event: Event): void {
    const input = event.target as HTMLInputElement;
    let amount = parseFloat(input.value);

    if (isNaN(amount) || amount < 0) {
      amount = 0;
      input.value = '0';
    }

    const total = this.orderTotal();
    if (amount > total) {
      amount = total;
      input.value = total.toString();
      console.warn('El anticipo no puede ser mayor que el total');
    }

    this.orderCartService.setAdvance(amount);
  }

  updateOrderNotes(event: Event): void {
    const input = event.target as HTMLInputElement;
    const notes = input.value;
    this.orderCartService.setNotes(notes);
  }

  updateQuantity(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let quantity = parseFloat(input.value);

    if (isNaN(quantity) || quantity < 1) {
      quantity = 1;
      input.value = '1';
    }

    quantity = Math.round(quantity);
    input.value = quantity.toString();

    this.orderCartService.updateItem(index, {quantity});
  }

  updatePrice(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let price = parseFloat(input.value);

    if (isNaN(price) || price < 0) {
      price = 0;
      input.value = '0';
    }

    this.orderCartService.updateItem(index, {price});
  }

  updateName(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const name = input.value.trim();

    if (name) {
      this.orderCartService.updateItem(index, {name});
    }
  }

  updateNotes(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const notes = input.value.trim();
    this.orderCartService.updateItem(index, {notes});
  }

  removeProduct(index: number): void {
    this.orderCartService.removeItem(index);
  }

  private isTextLikeTarget(el: EventTarget | null): boolean {
    const t = el as HTMLElement | null;
    if (!t) return false;
    const tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return true;
    if ((t as any).isContentEditable) return true;
    return false;
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(e: KeyboardEvent) {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    const isPrintShortcut = ctrlOrCmd && (e.key === 'p' || e.key === 'P');
    const isPreviewShortcut = ctrlOrCmd && (e.key === 'v' || e.key === 'V');

    if (isPrintShortcut) {
      e.preventDefault();
      this.router.navigate(['/order/select-product']);
      return;
    }

    if (isPreviewShortcut) {
      e.preventDefault();
      this.openPreview();
      return;
    }

    if (this.isTextLikeTarget(e.target)) return;
  }

  openPreview(): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/order/print'])
    );
    window.open(url, '_blank');
  }

  generateOrder(): void {
  }
}
