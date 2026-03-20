import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, Observable } from 'rxjs';
import { api_response, page_response } from '../../../../shared/models/common/response.model';
import { expense_create_request } from '../models/request/expense-create.request';
import { expense_create_response } from '../models/response/expense-create-response.model';
import { expense_list_response } from '../models/response/expense-list-response.model';
import { expense_detail_response } from '../models/response/expense-detail-response.model';
import { expense_concept_create_request } from '../models/request/expense-concept-create.request';
import { expense_concept_create_response } from '../models/response/expense-concept-create-response.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/expenses`;

  // obtiene listado de egresos con filtros y paginacion
  get_expenses(
    page: number,
    size: number,
    user_id?: number | null,
    payment_id?: number | null,
    created_after?: string | null,
    created_before?: string | null,
    sort_by: string = 'createdAt',
    sort_dir: 'asc' | 'desc' = 'desc'
  ): Observable<page_response<expense_list_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString())
      .set('sortBy', sort_by)
      .set('sortDir', sort_dir);

    if (user_id) params = params.set('userId', user_id.toString());
    if (payment_id) params = params.set('paymentId', payment_id.toString());
    if (created_after) params = params.set('createdAfter', created_after);
    if (created_before) params = params.set('createdBefore', created_before);

    return this.http.get<api_response<page_response<expense_list_response>>>(this.api_url, { params }).pipe(
      map(response => response.data)
    );
  }

  // obtiene un egreso por id
  get_expense(id: number): Observable<expense_detail_response> {
    return this.http.get<api_response<expense_detail_response>>(`${this.api_url}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // crea egreso
  create(request: expense_create_request): Observable<expense_create_response> {
    return this.http.post<api_response<expense_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }

  // crea concepto de egreso
  create_concept(request: expense_concept_create_request): Observable<expense_concept_create_response> {
    return this.http.post<api_response<expense_concept_create_response>>(`${this.api_url}/concepts`, request).pipe(
      map(response => response.data)
    );
  }
}
