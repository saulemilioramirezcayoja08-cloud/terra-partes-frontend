import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {QuotationListResponse} from '../get/models/quotation-list-response.model';
import {CreateQuotationRequest} from '../post/models/create-quotation-request.model';
import {CreateQuotationResponse} from '../post/models/create-quotation-response.model';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private readonly apiUrl = `${environment.apiBaseUrl}/quotations`;

  constructor(private http: HttpClient) {
  }

  getQuotations(
    params?: {
      number?: string;
      status?: string;
      username?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<QuotationListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<QuotationListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }

  createQuotation(
    payload: CreateQuotationRequest
  ): Observable<ApiResponse<CreateQuotationResponse>> {
    return this.http.post<ApiResponse<CreateQuotationResponse>>(
      this.apiUrl,
      payload
    );
  }
}
