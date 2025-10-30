import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ApiResponse} from '../../../core/models/api-response.model';
import {map, Observable} from 'rxjs';
import {CreateOrderResponse} from '../models/create-order-response.model';
import {CreateOrderRequest} from '../models/create-order-request.model';
import {AddOrderPaymentRequest} from '../models/add-order-payment-request.model';
import {AddOrderPaymentResponse} from '../models/add-order-payment-response.model';
import {ConfirmOrderRequest} from '../models/confirm-order-request.model';
import {ConfirmOrderResponse} from '../models/confirm-order-response.model';
import {OrderListResponse} from '../models/order-list-response.model';
import {PageResponse} from '../../../core/models/page-response.model';

export interface OrderListParams {
  number?: string;
  status?: string;
  username?: string;
  customerName?: string;
  paymentName?: string;
  warehouseName?: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {
  }

  listOrders(params: OrderListParams = {}): Observable<ApiResponse<PageResponse<OrderListResponse>>> {
    let httpParams = new HttpParams();

    if (params.number) {
      httpParams = httpParams.set('number', params.number);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.username) {
      httpParams = httpParams.set('username', params.username);
    }
    if (params.customerName) {
      httpParams = httpParams.set('customerName', params.customerName);
    }
    if (params.paymentName) {
      httpParams = httpParams.set('paymentName', params.paymentName);
    }
    if (params.warehouseName) {
      httpParams = httpParams.set('warehouseName', params.warehouseName);
    }
    if (params.notes) {
      httpParams = httpParams.set('notes', params.notes);
    }
    if (params.startDate) {
      httpParams = httpParams.set('startDate', params.startDate);
    }
    if (params.endDate) {
      httpParams = httpParams.set('endDate', params.endDate);
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<ApiResponse<PageResponse<OrderListResponse>>>(
      `${this.apiUrl}/list`,
      {params: httpParams}
    );
  }

  createOrder(request: CreateOrderRequest): Observable<ApiResponse<CreateOrderResponse>> {
    return this.http.post<ApiResponse<CreateOrderResponse>>(
      `${this.apiUrl}/create`,
      request
    );
  }

  addOrderPayment(orderId: number, request: AddOrderPaymentRequest): Observable<ApiResponse<AddOrderPaymentResponse>> {
    return this.http.post<ApiResponse<AddOrderPaymentResponse>>(
      `${this.apiUrl}/${orderId}/payments`,
      request
    ).pipe(
      map((resp) => {
        const totals: any = resp?.data?.totals;
        if (totals && typeof totals.orderTotal === 'number' && typeof totals.total !== 'number') {
          totals.total = totals.orderTotal;
        }
        return resp;
      })
    );
  }

  confirmOrder(orderId: number, request: ConfirmOrderRequest): Observable<ApiResponse<ConfirmOrderResponse>> {
    return this.http.put<ApiResponse<ConfirmOrderResponse>>(
      `${this.apiUrl}/${orderId}/confirm`,
      request
    );
  }
}
