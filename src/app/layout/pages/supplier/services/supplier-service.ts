import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {supplier_create_request} from '../models/request/supplier-create.request';
import {map, Observable} from 'rxjs';
import {supplier_create_response} from '../models/response/supplier-create-response.model';
import {api_response, page_response} from '../../../../shared/models/common/response.model';
import { supplier_search_response } from '../models/response/supplier-search-response.model';
import { supplier_detail_response } from '../models/response/supplier-detail-response.model';
import { supplier_update_request } from '../models/request/supplier-update.request';
import { supplier_update_response } from '../models/response/supplier-update-response.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private http = inject(HttpClient);
  private api_url = `${environment.api_url}/suppliers`;

  // busqueda paginada con filtros
  search(
    page: number,
    size: number,
    name?: string | null,
    email?: string | null,
    tax_id?: string | null,
    sort_by: string = 'name',
    sort_dir: string = 'asc'
  ): Observable<page_response<supplier_search_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (name?.trim()) params = params.set('name', name.trim());
    if (email?.trim()) params = params.set('email', email.trim());
    if (tax_id?.trim()) params = params.set('taxId', tax_id.trim());

    return this.http.get<api_response<page_response<supplier_search_response>>>(
      `${this.api_url}/search`, {params}
    ).pipe(map(response => response.data));
  }

  // obtiene detalle de un proveedor
  find_by_id(id: number): Observable<supplier_detail_response> {
    return this.http.get<api_response<supplier_detail_response>>(`${this.api_url}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // crea proveedor
  create(request: supplier_create_request): Observable<supplier_create_response> {
    return this.http.post<api_response<supplier_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }

  // actualiza proveedor
  update(id: number, request: supplier_update_request): Observable<supplier_update_response> {
    return this.http.put<api_response<supplier_update_response>>(`${this.api_url}/${id}`, request).pipe(
      map(response => response.data)
    );
  }
}