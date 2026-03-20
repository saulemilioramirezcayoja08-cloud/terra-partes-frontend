import {inject, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {map, Observable} from 'rxjs';
import {expense_concept_list_response} from '../../models/api/response/expense-concept-list-response.model';
import {api_response} from '../../models/common/response.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseConceptService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/expenses/concepts`;

  // obtiene lista de conceptos de egreso
  get_expense_concepts(): Observable<expense_concept_list_response[]> {
    return this.http.get<api_response<expense_concept_list_response[]>>(this.api_url).pipe(
      map(response => response.data)
    );
  }
}
