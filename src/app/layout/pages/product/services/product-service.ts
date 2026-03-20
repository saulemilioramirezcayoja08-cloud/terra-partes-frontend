import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {map, Observable} from 'rxjs';
import {api_response, page_response} from '../../../../shared/models/common/response.model';
import {product_list_response} from '../models/response/product-list-response.model';
import {product_create_request} from '../models/request/product-create.request';
import {product_create_response} from '../models/response/product-create-response.model';
import {product_update_request} from '../models/request/product-update.request';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private api_url = `${environment.api_url}/products`;

  // obtiene listado de productos con filtros y paginacion
  get_products(
    page: number,
    size: number,
    category_id?: number | null,
    search?: string | null,
    search_type?: string | null,
    code_type?: string | null
  ): Observable<page_response<product_list_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString());

    if (category_id) {
      params = params.set('categoryId', category_id.toString());
    }

    if (search && search.trim()) {
      const search_value = search.trim();

      if (search_type === 'NAME') {
        params = params.set('name', search_value);
      } else if (search_type === 'SKU') {
        params = params.set('sku', search_value);
      } else if (search_type === 'CODE' && code_type) {
        params = params.set('codeType', code_type);
        params = params.set('code', search_value);
      }
    }

    return this.http.get<api_response<page_response<product_list_response>>>(this.api_url, {params}).pipe(
      map(response => response.data)
    );
  }

  // obtiene un producto por id
  get_product(id: number): Observable<product_create_response> {
    return this.http.get<api_response<product_create_response>>(`${this.api_url}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // crea producto con codigos
  create(request: product_create_request): Observable<product_create_response> {
    return this.http.post<api_response<product_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }

  // actualiza producto con codigos
  update(id: number, request: product_update_request): Observable<product_create_response> {
    return this.http.put<api_response<product_create_response>>(`${this.api_url}/${id}`, request).pipe(
      map(response => response.data)
    );
  }
}
