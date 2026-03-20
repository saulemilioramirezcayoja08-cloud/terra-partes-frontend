import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { api_response, page_response } from '../../../../shared/models/common/response.model';
import { income_list_response } from '../models/response/income-list-response.model';
import { income_detail_response } from '../models/response/income-detail-response.model';
import { income_create_request } from '../models/request/income-create.request';
import { income_create_response } from '../models/response/income-create-response.model';
import { income_concept_create_request } from '../models/request/income-concept-create.request';
import { income_concept_create_response } from '../models/response/income-concept-create-response.model';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/incomes`;

  // obtiene listado de ingresos con filtros y paginacion
  get_incomes(
    page: number,
    size: number,
    user_id?: number | null,
    payment_id?: number | null,
    created_after?: string | null,
    created_before?: string | null,
    sort_by: string = 'createdAt',
    sort_dir: 'asc' | 'desc' = 'desc'
  ): Observable<page_response<income_list_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (user_id) params = params.set('userId', user_id.toString());
    if (payment_id) params = params.set('paymentId', payment_id.toString());
    if (created_after) params = params.set('createdAfter', created_after);
    if (created_before) params = params.set('createdBefore', created_before);

    return this.http.get<api_response<page_response<income_list_response>>>(this.api_url, { params }).pipe(
      map(response => response.data)
    );
  }

  // obtiene un ingreso por id
  get_income(id: number): Observable<income_detail_response> {
    return this.http.get<api_response<income_detail_response>>(`${this.api_url}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // crea ingreso
  create(request: income_create_request): Observable<income_create_response> {
    return this.http.post<api_response<income_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }

  // crea concepto de ingreso
  create_concept(request: income_concept_create_request): Observable<income_concept_create_response> {
    return this.http.post<api_response<income_concept_create_response>>(`${this.api_url}/concepts`, request).pipe(
      map(response => response.data)
    );
  }
}