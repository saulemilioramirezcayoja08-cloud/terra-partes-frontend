import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {CustomerListResponse} from '../get/models/customer-list-response.model';
import {CreateCustomerRequest} from '../post/models/create-customer-request.model';
import {CreateCustomerResponse} from '../post/models/create-customer-response.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = `${environment.apiBaseUrl}/customers`;

  constructor(private http: HttpClient) {
  }

  getCustomers(
    params?: {
      name?: string;
      taxId?: string;
      phone?: string;
      email?: string;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<CustomerListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<CustomerListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }

  createCustomer(
    payload: CreateCustomerRequest
  ): Observable<ApiResponse<CreateCustomerResponse>> {
    return this.http.post<ApiResponse<CreateCustomerResponse>>(
      this.apiUrl,
      payload
    );
  }
}
