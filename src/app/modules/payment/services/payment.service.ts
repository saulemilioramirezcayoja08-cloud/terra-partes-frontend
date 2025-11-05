import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {PaymentListResponse} from '../get/models/payment-list-response.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiBaseUrl}/payments`;

  constructor(private http: HttpClient) {
  }

  getPayments(
    params?: {
      code?: string;
      name?: string;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<PaymentListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<PaymentListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }
}
