import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {supplier_create_request} from '../models/request/supplier-create.request';
import {map, Observable} from 'rxjs';
import {supplier_create_response} from '../models/response/supplier-create-response.model';
import {api_response} from '../../../../shared/models/common/response.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private http = inject(HttpClient);
  private api_url = `${environment.api_url}/suppliers`;

  // crea proveedor
  create(request: supplier_create_request): Observable<supplier_create_response> {
    return this.http.post<api_response<supplier_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }
}
