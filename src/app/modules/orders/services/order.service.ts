import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ApiResponse} from '../../../core/models/api-response.model';
import {Observable} from 'rxjs';
import {CreateOrderResponse} from '../models/create-order-response.model';
import {CreateOrderRequest} from '../models/create-order-request.model';
import {AddOrderPaymentRequest} from '../models/add-order-payment-request.model';
import {AddOrderPaymentResponse} from '../models/add-order-payment-response.model';
import {ConfirmOrderRequest} from '../models/confirm-order-request.model';
import {ConfirmOrderResponse} from '../models/confirm-order-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private http: HttpClient) {
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
    );
  }

  confirmOrder(orderId: number, request: ConfirmOrderRequest): Observable<ApiResponse<ConfirmOrderResponse>> {
    return this.http.put<ApiResponse<ConfirmOrderResponse>>(
      `${this.apiUrl}/${orderId}/confirm`,
      request
    );
  }
}
