import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {ProductListResponse} from '../get/models/product-list-response.model';
import {CreateProductRequest} from '../post/models/create-product-request.model';
import {CreateProductResponse} from '../post/models/create-product-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {
  }

  getProducts(
    params?: {
      name?: string;
      code?: string;
      page?: number;
      size?: number
    }
  ): Observable<ApiResponse<PageResponse<ProductListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<ProductListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }

  createProduct(
    payload: CreateProductRequest
  ): Observable<ApiResponse<CreateProductResponse>> {
    return this.http.post<ApiResponse<CreateProductResponse>>(
      this.apiUrl,
      payload
    );
  }
}
