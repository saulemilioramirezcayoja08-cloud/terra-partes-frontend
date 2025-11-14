import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {PurchaseListResponse} from '../get/models/purchase-list-response.model';
import {CreatePurchaseRequest} from '../post/models/create-purchase-request.model';
import {CreatePurchaseResponse} from '../post/models/create-purchase-response.model';
import {ConfirmPurchaseRequest} from '../put/models/confirm-purchase-request.model';
import {ConfirmPurchaseResponse} from '../put/models/confirm-purchase-response.model';
import { CreatePurchasePaymentRequest } from '../purchase/post/models/create-purchase-payment-request.model';
import { CreatePurchasePaymentResponse } from '../post/models/create-purchase-payment-response.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly apiUrl = `${environment.apiBaseUrl}/purchases`;

  constructor(private http: HttpClient) {
  }

  getPurchases(
    params?: {
      number?: string;
      status?: string;
      username?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<PurchaseListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<PurchaseListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }

  createPurchase(
    payload: CreatePurchaseRequest
  ): Observable<ApiResponse<CreatePurchaseResponse>> {
    return this.http.post<ApiResponse<CreatePurchaseResponse>>(
      this.apiUrl,
      payload
    );
  }

  confirmPurchase(
    id: number,
    payload?: ConfirmPurchaseRequest
  ): Observable<ApiResponse<ConfirmPurchaseResponse>> {
    return this.http.put<ApiResponse<ConfirmPurchaseResponse>>(
      `${this.apiUrl}/${id}/confirm`,
      payload || {}
    );
  }

  createPayment(
    purchaseId: number,
    payload: CreatePurchasePaymentRequest
  ): Observable<ApiResponse<CreatePurchasePaymentResponse>> {
    return this.http.post<ApiResponse<CreatePurchasePaymentResponse>>(
      `${this.apiUrl}/${purchaseId}/payments`,
      payload
    );
  }
}