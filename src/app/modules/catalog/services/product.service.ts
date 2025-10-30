import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {ProductListResponse} from '../models/product-list-response.model';
import {PageResponse} from '../../../core/models/page-response.model';

export interface ProductListParams {
  name?: string;
  description?: string;
  categoryName?: string;
  codeType?: string;
  code?: string;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) {
  }

  listProducts(params: ProductListParams = {}): Observable<ApiResponse<PageResponse<ProductListResponse>>> {
    let httpParams = new HttpParams();

    if (params.name) {
      httpParams = httpParams.set('name', params.name);
    }
    if (params.description) {
      httpParams = httpParams.set('description', params.description);
    }
    if (params.categoryName) {
      httpParams = httpParams.set('categoryName', params.categoryName);
    }
    if (params.codeType) {
      httpParams = httpParams.set('codeType', params.codeType);
    }
    if (params.code) {
      httpParams = httpParams.set('code', params.code);
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<ApiResponse<PageResponse<ProductListResponse>>>(
      `${this.apiUrl}/list`,
      {params: httpParams}
    );
  }

  searchByName(name: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<ProductListResponse>>> {
    return this.listProducts({name, page, size});
  }

  searchByCode(code: string, codeType?: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<ProductListResponse>>> {
    return this.listProducts({code, codeType, page, size});
  }

  searchByCategory(categoryName: string, page: number = 0, size: number = 20): Observable<ApiResponse<PageResponse<ProductListResponse>>> {
    return this.listProducts({categoryName, page, size});
  }
}
