import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {OrderListResponse} from '../get/models/order-list-response.model';
import {CreateOrderRequest} from '../post/models/create-order-request.model';
import {CreateOrderResponse} from '../post/models/create-order-response.model';
import {ConfirmOrderRequest} from '../put/models/confirm-order-request.model';
import {ConfirmOrderResponse} from '../put/models/confirm-order-response.model';
import {CreateOrderPaymentRequest} from '../post/models/create-order-payment-request.model';
import {CreateOrderPaymentResponse} from '../post/models/create-order-payment-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {
  }

  getOrders(
    params?: {
      number?: string;
      status?: string;
      username?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<OrderListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<OrderListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }

  createOrder(
    payload: CreateOrderRequest
  ): Observable<ApiResponse<CreateOrderResponse>> {
    return this.http.post<ApiResponse<CreateOrderResponse>>(
      this.apiUrl,
      payload
    );
  }

  confirmOrder(
    id: number,
    payload?: ConfirmOrderRequest
  ): Observable<ApiResponse<ConfirmOrderResponse>> {
    return this.http.put<ApiResponse<ConfirmOrderResponse>>(
      `${this.apiUrl}/${id}/confirm`,
      payload || {}
    );
  }

  createPayment(
    orderId: number,
    payload: CreateOrderPaymentRequest
  ): Observable<ApiResponse<CreateOrderPaymentResponse>> {
    return this.http.post<ApiResponse<CreateOrderPaymentResponse>>(
      `${this.apiUrl}/${orderId}/payments`,
      payload
    );
  }
}
