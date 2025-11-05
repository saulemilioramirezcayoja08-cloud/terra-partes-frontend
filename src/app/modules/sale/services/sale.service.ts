import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ApiResponse} from '../../../core/models/api-response.model';
import {SaleListResponse} from '../get/models/sale-list-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {Observable} from 'rxjs';
import {ConfirmSaleRequest} from '../put/models/confirm-sale-request.model';
import {ConfirmSaleResponse} from '../put/models/confirm-sale-response.model';
import {CreateSalePaymentRequest} from '../post/models/create-sale-payment-request.model';
import {CreateSalePaymentResponse} from '../post/models/create-sale-payment-response.model';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private readonly apiUrl = `${environment.apiBaseUrl}/sales`;

  constructor(private http: HttpClient) {
  }

  getSales(
    params?: {
      number?: string;
      status?: string;
      username?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<SaleListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<SaleListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }

  createPayment(
    saleId: number,
    payload: CreateSalePaymentRequest
  ): Observable<ApiResponse<CreateSalePaymentResponse>> {
    return this.http.post<ApiResponse<CreateSalePaymentResponse>>(
      `${this.apiUrl}/${saleId}/payments`,
      payload
    );
  }

  confirmSale(
    id: number,
    payload?: ConfirmSaleRequest
  ): Observable<ApiResponse<ConfirmSaleResponse>> {
    return this.http.put<ApiResponse<ConfirmSaleResponse>>(
      `${this.apiUrl}/${id}/confirm`,
      payload || {}
    );
  }
}
