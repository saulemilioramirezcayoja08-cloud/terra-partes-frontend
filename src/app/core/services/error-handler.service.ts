import { Injectable } from '@angular/core';
import { ErrorResponse } from '../models/error-response.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly errorMessages: Record<string, string> = {
    'USER_NOT_FOUND': 'Usuario no encontrado',
    'USER_INACTIVE': 'Usuario inactivo',
    'INVALID_CREDENTIALS': 'Credenciales inválidas',

    'CUSTOMER_NOT_FOUND': 'Cliente no encontrado',
    'CUSTOMER_TAX_ID_DUPLICATE': 'El NIT/CI del cliente ya existe', // Nueva
    'WAREHOUSE_NOT_FOUND': 'Almacén no encontrado',
    'PRODUCT_NOT_FOUND': 'Producto no encontrado',
    'PRODUCT_SKU_DUPLICATE': 'El código SKU ya existe',
    'CATEGORY_NOT_FOUND': 'Categoría no encontrada',
    'PAYMENT_NOT_FOUND': 'Método de pago no encontrado',
    'ORDER_NOT_FOUND': 'Orden no encontrada',
    'QUOTATION_NOT_FOUND': 'Cotización no encontrada',
    'SALE_NOT_FOUND': 'Venta no encontrada',
    'PURCHASE_NOT_FOUND': 'Compra no encontrada',
    'SUPPLIER_NOT_FOUND': 'Proveedor no encontrado', // Nueva
    'SUPPLIER_EMAIL_DUPLICATE': 'El email del proveedor ya existe', // Nueva

    'INSUFFICIENT_STOCK': 'Stock insuficiente para completar la operación',
    'PAYMENT_EXCEEDS_TOTAL': 'El pago excede el total',
    'QUOTATION_ALREADY_CONFIRMED': 'La cotización ya fue confirmada',
    'ORDER_ALREADY_CONFIRMED': 'La orden ya fue confirmada',

    'VALIDATION_ERROR': 'Error de validación en los datos enviados',
    'RESOURCE_NOT_FOUND': 'Recurso no encontrado',
    'UNAUTHORIZED': 'No autorizado para realizar esta acción',

    'UNKNOWN_ERROR': 'Error desconocido',
    'NETWORK_ERROR': 'Error de conexión con el servidor'
  };

  handleError(error: ErrorResponse, defaultMessage: string = 'Error desconocido'): string {
    return this.errorMessages[error.code] ||
      this.errorMessages[error.message] ||
      error.message ||
      defaultMessage;
  }
}