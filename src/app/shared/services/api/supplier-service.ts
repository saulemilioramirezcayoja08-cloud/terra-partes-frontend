import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { supplier_list_response } from '../../models/api/response/supplier-list-response.model';
import { api_response } from '../../models/common/response.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/suppliers`;

  // obtiene lista de proveedores
  get_suppliers(): Observable<supplier_list_response[]> {
    return this.http.get<api_response<supplier_list_response[]>>(this.api_url).pipe(
      map(response => response.data)
    );
  }
}