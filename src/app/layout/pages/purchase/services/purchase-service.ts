import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { api_response, page_response } from '../../../../shared/models/common/response.model';
import { purchase_list_response } from '../models/response/purchase-list-response.model';
import { purchase_detail_response } from '../models/response/purchase-detail-response.model';
import { purchase_create_request } from '../models/request/purchase-create.request';
import { purchase_create_response } from '../models/response/purchase-create-response.model';
import { purchase_complete_response } from '../models/response/purchase-complete-response.model';
import { purchase_payment_list_response } from '../models/response/purchase-payment-list-response.model';
import { purchase_payment_response } from '../models/response/purchase-payment-response.model';
import { purchase_payment_request } from '../models/request/purchase-payment.request';
import { purchase_payables_response } from '../models/response/purchase-payables-response.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/purchases`;

  // obtiene listado de compras con filtros y paginacion
  get_purchases(
    page: number,
    size: number,
    user_id?: number | null,
    supplier_id?: number | null,
    status?: string | null,
    payment_id?: number | null,
    type?: string | null,
    created_after?: string | null,
    created_before?: string | null,
    sort_by: string = 'createdAt',
    sort_dir: 'asc' | 'desc' = 'desc'
  ): Observable<page_response<purchase_list_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (user_id) params = params.set('userId', user_id.toString());
    if (supplier_id) params = params.set('supplierId', supplier_id.toString());
    if (status && status.trim()) params = params.set('status', status.trim());
    if (payment_id) params = params.set('paymentId', payment_id.toString());
    if (type && type.trim()) params = params.set('type', type.trim());
    if (created_after) params = params.set('createdAfter', created_after);
    if (created_before) params = params.set('createdBefore', created_before);

    return this.http.get<api_response<page_response<purchase_list_response>>>(this.api_url, {params}).pipe(
      map(response => response.data)
    );
  }

  // obtiene una compra por id
  get_purchase(id: number): Observable<purchase_detail_response> {
    return this.http.get<api_response<purchase_detail_response>>(`${this.api_url}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // crea una nueva compra
  create_purchase(request: purchase_create_request): Observable<purchase_create_response> {
    return this.http.post<api_response<purchase_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }

  // completa una compra
  complete(id: number): Observable<purchase_complete_response> {
    return this.http.patch<api_response<purchase_complete_response>>(`${this.api_url}/${id}/complete`, {}).pipe(
      map(response => response.data)
    );
  }

  // obtiene pagos de una compra
  get_payments(purchase_id: number): Observable<purchase_payment_list_response> {
    return this.http.get<api_response<purchase_payment_list_response>>(`${this.api_url}/${purchase_id}/payments`).pipe(
      map(response => response.data)
    );
  }

  // agrega pago a una compra
  add_payment(purchase_id: number, request: purchase_payment_request): Observable<purchase_payment_response> {
    return this.http.post<api_response<purchase_payment_response>>(`${this.api_url}/${purchase_id}/payments`, request).pipe(
      map(response => response.data)
    );
  }

  // obtiene cuentas por pagar con filtros y paginacion
  get_payables(
    page: number,
    size: number,
    supplier_id?: number | null,
    warehouse_id?: number | null,
    payment_id?: number | null,
    created_after?: string | null,
    created_before?: string | null,
    sort_by: string = 'createdAt',
    sort_dir: 'asc' | 'desc' = 'desc'
  ): Observable<page_response<purchase_payables_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (supplier_id) params = params.set('supplierId', supplier_id.toString());
    if (warehouse_id) params = params.set('warehouseId', warehouse_id.toString());
    if (payment_id) params = params.set('paymentId', payment_id.toString());
    if (created_after) params = params.set('createdAfter', created_after);
    if (created_before) params = params.set('createdBefore', created_before);

    return this.http.get<api_response<page_response<purchase_payables_response>>>(`${this.api_url}/payables`, {params}).pipe(
      map(response => response.data)
    );
  }
}