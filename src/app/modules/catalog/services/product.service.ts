import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {ProductListResponse} from '../get/models/product-list-response.model';
import {CreateProductRequest} from '../post/models/create-product-request.model';
import {CreateProductResponse} from '../post/models/create-product-response.model';
import { UpdateProductRequest } from '../patch/models/update-product-request.model';
import { UpdateProductResponse } from '../patch/models/update-product-response.model';
import { AddCodeRequest } from '../codes/models/add-code-request.model';
import { AddCodeResponse } from '../codes/models/add-code-response.model';
import { UpdateCodeRequest } from '../codes/models/update-code-request.model';
import { UpdateCodeResponse } from '../codes/models/update-code-response.model';

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
      sku?: string;
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

  updateProduct(
    productId: number,
    payload: UpdateProductRequest
  ): Observable<ApiResponse<UpdateProductResponse>> {
    return this.http.patch<ApiResponse<UpdateProductResponse>>(
      `${this.apiUrl}/${productId}`,
      payload
    );
  }

  addCodes(
    productId: number,
    payload: AddCodeRequest
  ): Observable<ApiResponse<AddCodeResponse>> {
    return this.http.post<ApiResponse<AddCodeResponse>>(
      `${this.apiUrl}/${productId}/codes`,
      payload
    );
  }

  updateCode(
    productId: number,
    codeId: number,
    payload: UpdateCodeRequest
  ): Observable<ApiResponse<UpdateCodeResponse>> {
    return this.http.put<ApiResponse<UpdateCodeResponse>>(
      `${this.apiUrl}/${productId}/codes/${codeId}`,
      payload
    );
  }
}