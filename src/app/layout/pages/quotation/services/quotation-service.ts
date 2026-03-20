import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { api_response, page_response } from '../../../../shared/models/common/response.model';
import { quotation_list_response } from '../models/response/quotation-list-response.model';
import { quotation_detail_response } from '../models/response/quotation-detail-response.model';
import { quotation_create_request } from '../models/request/quotation-create.request';
import { quotation_create_response } from '../models/response/quotation-create-response.model';

@Injectable({
  providedIn: 'root',
})
export class QuotationService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/quotations`;

  // obtiene listado de cotizaciones con filtros y paginacion
  get_quotations(
    page: number,
    size: number,
    user_id?: number | null,
    customer_id?: number | null,
    status?: string | null,
    created_after?: string | null,
    created_before?: string | null,
    sort_by: string = 'createdAt',
    sort_dir: 'asc' | 'desc' = 'desc'
  ): Observable<page_response<quotation_list_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (user_id) params = params.set('userId', user_id.toString());
    if (customer_id) params = params.set('customerId', customer_id.toString());
    if (status && status.trim()) params = params.set('status', status.trim());
    if (created_after) params = params.set('createdAfter', created_after);
    if (created_before) params = params.set('createdBefore', created_before);

    return this.http.get<api_response<page_response<quotation_list_response>>>(this.api_url, {params}).pipe(
      map(response => response.data)
    );
  }

  // obtiene una cotizacion por id
  get_quotation(id: number): Observable<quotation_detail_response> {
    return this.http.get<api_response<quotation_detail_response>>(`${this.api_url}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // crea una nueva cotizacion
  create_quotation(request: quotation_create_request): Observable<quotation_create_response> {
    return this.http.post<api_response<quotation_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }
}