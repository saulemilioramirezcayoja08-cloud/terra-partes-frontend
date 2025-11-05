import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {SupplierListResponse} from '../get/models/supplier-list-response.model';
import {CreateSupplierRequest} from '../post/models/create-supplier-request.model';
import {CreateSupplierResponse} from '../post/models/create-supplier-response.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly apiUrl = `${environment.apiBaseUrl}/suppliers`;

  constructor(private http: HttpClient) {
  }

  getSuppliers(
    params?: {
      name?: string;
      taxId?: string;
      phone?: string;
      email?: string;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<SupplierListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<SupplierListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }

  createSupplier(
    payload: CreateSupplierRequest
  ): Observable<ApiResponse<CreateSupplierResponse>> {
    return this.http.post<ApiResponse<CreateSupplierResponse>>(
      this.apiUrl,
      payload
    );
  }
}
