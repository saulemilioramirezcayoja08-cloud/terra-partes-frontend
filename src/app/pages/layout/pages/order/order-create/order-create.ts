import {Component, HostListener, inject} from '@angular/core';
import {Router} from '@angular/router';
import {OrderCartService} from '../../../../../modules/orders/services/order-cart-service';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../../../../modules/auth/services/auth.service';
import {OrderService} from '../../../../../modules/orders/services/order.service';

@Component({
  selector: 'app-order-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-create.html',
  styleUrl: './order-create.css'
})
export class OrderCreate {
  private router = inject(Router);
  private orderCartService = inject(OrderCartService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);

  preview = this.orderCartService.preview;
  customer = this.orderCartService.customer;
  warehouse = this.orderCartService.warehouse;
  paymentMethod = this.orderCartService.paymentMethod;
  details = this.orderCartService.details;
  orderTotal = this.orderCartService.total;
  advanceAmount = this.orderCartService.advance;
  pendingAmount = this.orderCartService.pendingAmount;
  orderNotes = this.orderCartService.notes;

  hasLastOrder(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('current_order') !== null;
  }

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
    }

    const currentUser = this.authService.currentUser;
    this.orderCartService.setAdvance(amount, currentUser?.id);
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

    this.orderCartService.updateDetail(index, {quantity});
  }

  updatePrice(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let price = parseFloat(input.value);

    if (isNaN(price) || price < 0) {
      price = 0;
      input.value = '0';
    }

    this.orderCartService.updateDetail(index, {price});
  }

  updateName(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const name = input.value.trim();

    if (name) {
      this.orderCartService.updateDetail(index, {name});
    }
  }

  updateNotes(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const notes = input.value.trim();
    this.orderCartService.updateDetail(index, {notes});
  }

  removeProduct(index: number): void {
    this.orderCartService.removeDetail(index);
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
      this.router.createUrlTree(['/order/print'], {
        queryParams: {mode: 'preview'}
      })
    );
    window.open(url, '_blank');
  }

  openLastOrder(): void {
    if (!this.hasLastOrder()) {
      alert('No hay ninguna orden creada recientemente');
      return;
    }

    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/order/print'])
    );
    window.open(url, '_blank');
  }

  private validateOrder(): string | null {
    const details = this.details();

    if (details.length === 0) {
      return 'El carrito está vacío. Agrega productos antes de generar la orden.';
    }

    for (let i = 0; i < details.length; i++) {
      const item = details[i];
      const itemNumber = i + 1;

      if (!item.name || item.name.trim() === '') {
        return `El producto #${itemNumber} no tiene nombre.`;
      }

      if (item.quantity <= 0) {
        return `El producto #${itemNumber} (${item.name}) tiene cantidad inválida. Debe ser mayor a 0.`;
      }

      if (item.price <= 0) {
        return `El producto #${itemNumber} (${item.name}) tiene precio inválido. El precio debe ser mayor a 0.`;
      }

      if (item.subtotal <= 0) {
        return `El producto #${itemNumber} (${item.name}) tiene un subtotal inválido.`;
      }
    }

    const total = this.orderTotal();
    if (total <= 0) {
      return 'El total de la orden debe ser mayor a 0.';
    }

    const advanceAmount = this.advanceAmount();
    if (advanceAmount < 0) {
      return 'El anticipo no puede ser negativo.';
    }

    if (advanceAmount > total) {
      return 'El anticipo no puede ser mayor al total de la orden.';
    }

    return null;
  }

  generateOrder(): void {
    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      alert('Error: No hay usuario autenticado');
      return;
    }

    const validationError = this.validateOrder();
    if (validationError) {
      alert(validationError);
      return;
    }

    const orderRequest = this.orderCartService.toCreateOrderRequest(currentUser.id);

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        if (response.success) {
          localStorage.setItem('current_order', JSON.stringify(response.data));
          this.orderCartService.clear();

          const verOrden = confirm(
            `${response.message}\n\n` +
            `Número de orden: ${response.data.number}\n` +
            `Total: Bs. ${response.data.totals.total.toFixed(2)}\n` +
            `Anticipo: Bs. ${response.data.totals.totalPayments.toFixed(2)}\n` +
            `Saldo: Bs. ${response.data.totals.pendingAmount.toFixed(2)}\n\n` +
            `¿Deseas ver la orden generada?`
          );

          if (verOrden) {
            const url = this.router.serializeUrl(
              this.router.createUrlTree(['/order/print'])
            );
            window.open(url, '_blank');
          }
        } else {
          alert(`Error: ${response.message}`);
        }
      },
      error: (error) => {
        alert(`Error al crear la orden: ${error.message || 'Error desconocido'}`);
      }
    });
  }
}
