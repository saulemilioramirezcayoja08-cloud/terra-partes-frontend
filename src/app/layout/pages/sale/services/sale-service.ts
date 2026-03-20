import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {map, Observable} from 'rxjs';
import {api_response, page_response} from '../../../../shared/models/common/response.model';
import {sale_list_response} from '../models/response/sale-list-response.model';
import {sale_complete_response} from '../models/response/sale-complete-response.model';
import {sale_detail_response} from '../models/response/sale-detail-response.model';
import {sale_payment_list_response} from '../models/response/sale-payment-list-response.model';
import {sale_payment_response} from '../models/response/sale-payment-response.model';
import {sale_payment_request} from '../models/request/sale-payment.request';
import {sale_completion_preview_response} from '../models/response/sale-completion-preview-response.model';
import { sale_profit_response } from '../models/response/sale-profit-response.model';
import { sale_profit_traceability_response } from '../models/response/sale-profit-traceability-response.model';
import { sale_receivables_response } from '../models/response/sale-receivables-response.model';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/sales`;

  // obtiene listado de ventas con filtros y paginacion
  get_sales(
    page: number,
    size: number,
    user_id?: number | null,
    customer_id?: number | null,
    status?: string | null,
    payment_id?: number | null,
    created_after?: string | null,
    created_before?: string | null,
    sort_by: string = 'createdAt',
    sort_dir: 'asc' | 'desc' = 'desc'
  ): Observable<page_response<sale_list_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (user_id) params = params.set('userId', user_id.toString());
    if (customer_id) params = params.set('customerId', customer_id.toString());
    if (status && status.trim()) params = params.set('status', status.trim());
    if (payment_id) params = params.set('paymentId', payment_id.toString());
    if (created_after) params = params.set('createdAfter', created_after);
    if (created_before) params = params.set('createdBefore', created_before);

    return this.http.get<api_response<page_response<sale_list_response>>>(this.api_url, {params}).pipe(
      map(response => response.data)
    );
  }

  // obtiene una venta por id
  get_sale(id: number): Observable<sale_detail_response> {
    return this.http.get<api_response<sale_detail_response>>(`${this.api_url}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // obtiene preview de completar venta
  get_completion_preview(id: number): Observable<sale_completion_preview_response> {
    return this.http.get<api_response<sale_completion_preview_response>>(`${this.api_url}/${id}/complete/preview`).pipe(
      map(response => response.data)
    );
  }

  // completa una venta
  complete(id: number): Observable<sale_complete_response> {
    return this.http.patch<api_response<sale_complete_response>>(`${this.api_url}/${id}/complete`, {}).pipe(
      map(response => response.data)
    );
  }

  // obtiene pagos de una venta
  get_payments(sale_id: number): Observable<sale_payment_list_response> {
    return this.http.get<api_response<sale_payment_list_response>>(`${this.api_url}/${sale_id}/payments`).pipe(
      map(response => response.data)
    );
  }

  // agrega pago a una venta
  add_payment(sale_id: number, request: sale_payment_request): Observable<sale_payment_response> {
    return this.http.post<api_response<sale_payment_response>>(`${this.api_url}/${sale_id}/payments`, request).pipe(
      map(response => response.data)
    );
  }

  // obtiene utilidad de ventas completadas con filtros y paginacion
  get_profit(
    page: number,
    size: number,
    customer_id?: number | null,
    warehouse_id?: number | null,
    category_id?: number | null,
    sku?: string | null,
    product_name?: string | null,
    created_after?: string | null,
    created_before?: string | null,
    sort_by: string = 'createdAt',
    sort_dir: 'asc' | 'desc' = 'desc'
  ): Observable<page_response<sale_profit_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (customer_id) params = params.set('customerId', customer_id.toString());
    if (warehouse_id) params = params.set('warehouseId', warehouse_id.toString());
    if (category_id) params = params.set('categoryId', category_id.toString());
    if (sku && sku.trim()) params = params.set('sku', sku.trim());
    if (product_name && product_name.trim()) params = params.set('productName', product_name.trim());
    if (created_after) params = params.set('createdAfter', created_after);
    if (created_before) params = params.set('createdBefore', created_before);

    return this.http.get<api_response<page_response<sale_profit_response>>>(`${this.api_url}/profit`, {params}).pipe(
      map(response => response.data)
    );
  }

  // obtiene trazabilidad fifo de utilidad de una venta
  get_profit_traceability(sale_id: number): Observable<sale_profit_traceability_response> {
    return this.http.get<api_response<sale_profit_traceability_response>>(`${this.api_url}/${sale_id}/profit/traceability`).pipe(
      map(response => response.data)
    );
  }

  // obtiene cuentas por cobrar con filtros y paginacion
  get_receivables(
    page: number,
    size: number,
    customer_id?: number | null,
    warehouse_id?: number | null,
    payment_id?: number | null,
    created_after?: string | null,
    created_before?: string | null,
    sort_by: string = 'createdAt',
    sort_dir: 'asc' | 'desc' = 'desc'
  ): Observable<page_response<sale_receivables_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (customer_id) params = params.set('customerId', customer_id.toString());
    if (warehouse_id) params = params.set('warehouseId', warehouse_id.toString());
    if (payment_id) params = params.set('paymentId', payment_id.toString());
    if (created_after) params = params.set('createdAfter', created_after);
    if (created_before) params = params.set('createdBefore', created_before);

    return this.http.get<api_response<page_response<sale_receivables_response>>>(`${this.api_url}/receivables`, {params}).pipe(
      map(response => response.data)
    );
  }
}