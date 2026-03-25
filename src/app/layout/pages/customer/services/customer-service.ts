import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {customer_create_request} from '../models/request/customer-create.request';
import {map, Observable} from 'rxjs';
import {customer_create_response} from '../models/response/customer-create-response.model';
import {api_response, page_response} from '../../../../shared/models/common/response.model';
import { customer_search_response } from '../models/response/customer-search-response.model';
import { customer_detail_response } from '../models/response/customer-detail-response.model';
import { customer_update_request } from '../models/request/customer-update.request';
import { customer_update_response } from '../models/response/customer-update-response.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private api_url = `${environment.api_url}/customers`;

  // busqueda paginada con filtros
  search(
    page: number,
    size: number,
    name?: string | null,
    email?: string | null,
    tax_id?: string | null,
    sort_by: string = 'name',
    sort_dir: string = 'asc'
  ): Observable<page_response<customer_search_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (name?.trim()) params = params.set('name', name.trim());
    if (email?.trim()) params = params.set('email', email.trim());
    if (tax_id?.trim()) params = params.set('taxId', tax_id.trim());

    return this.http.get<api_response<page_response<customer_search_response>>>(
      `${this.api_url}/search`, {params}
    ).pipe(map(response => response.data));
  }

  // obtiene detalle de un cliente
  find_by_id(id: number): Observable<customer_detail_response> {
    return this.http.get<api_response<customer_detail_response>>(`${this.api_url}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // crea cliente
  create(request: customer_create_request): Observable<customer_create_response> {
    return this.http.post<api_response<customer_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }

  // actualiza cliente
  update(id: number, request: customer_update_request): Observable<customer_update_response> {
    return this.http.put<api_response<customer_update_response>>(`${this.api_url}/${id}`, request).pipe(
      map(response => response.data)
    );
  }
}