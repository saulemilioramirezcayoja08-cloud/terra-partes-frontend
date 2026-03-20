import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {customer_create_request} from '../models/request/customer-create.request';
import {map, Observable} from 'rxjs';
import {customer_create_response} from '../models/response/customer-create-response.model';
import {api_response} from '../../../../shared/models/common/response.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private api_url = `${environment.api_url}/customers`;

  // crea cliente
  create(request: customer_create_request): Observable<customer_create_response> {
    return this.http.post<api_response<customer_create_response>>(this.api_url, request).pipe(
      map(response => response.data)
    );
  }
}
