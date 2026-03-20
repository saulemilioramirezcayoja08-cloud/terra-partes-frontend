import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { income_concept_list_response } from '../../models/api/response/income-concept-list-response.model';
import { api_response } from '../../models/common/response.model';

@Injectable({
  providedIn: 'root',
})
export class IncomeConceptService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/incomes/concepts`;

  // obtiene lista de conceptos de ingreso
  get_income_concepts(): Observable<income_concept_list_response[]> {
    return this.http.get<api_response<income_concept_list_response[]>>(this.api_url).pipe(
      map(response => response.data)
    );
  }
}