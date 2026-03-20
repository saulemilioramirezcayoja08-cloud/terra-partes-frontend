import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {order_create_request} from '../models/request/order-create.request';
import {map, Observable} from 'rxjs';
import {api_response, page_response} from '../../../../shared/models/common/response.model';
import {order_create_response} from '../models/response/order-create-response.model';
import {order_list_response} from '../models/response/order-list-response.model';
import {order_complete_response} from '../models/response/order-complete-response.model';
import {order_payment_list_response} from '../models/response/order-payment-list-response.model';
import {order_payment_response} from '../models/response/order-payment-response.model';
import {order_payment_request} from '../models/request/order-payment.request';
import {order_detail_response} from '../models/response/order-detail-response.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/orders`;

  // obtiene listado de ordenes con filtros y paginacion
  get_orders(
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
  ): Observable<page_response<order_list_response>> {
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

    return this.http.get<api_response<page_response<order_list_response>>>(this.api_url, {params}).pipe(
      map(response => response.data)
    );
  }

  // obtiene una orden por id
  get_order(id: number): Observable<order_detail_response> {
    return this.http.get<api_response<order_detail_response>>(`${this.api_url}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // crea una nueva orden
  create_order(request: order_create_request): Observable<order_create_response> {
    return this.http.post<api_response<order_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }

  // completa una orden
  complete(id: number): Observable<order_complete_response> {
    return this.http.patch<api_response<order_complete_response>>(`${this.api_url}/${id}/complete`, {}).pipe(
      map(response => response.data)
    );
  }

  // obtiene pagos de una orden
  get_payments(order_id: number): Observable<order_payment_list_response> {
    return this.http.get<api_response<order_payment_list_response>>(`${this.api_url}/${order_id}/payments`).pipe(
      map(response => response.data)
    );
  }

  // agrega pago a una orden
  add_payment(order_id: number, request: order_payment_request): Observable<order_payment_response> {
    return this.http.post<api_response<order_payment_response>>(`${this.api_url}/${order_id}/payments`, request).pipe(
      map(response => response.data)
    );
  }
}
