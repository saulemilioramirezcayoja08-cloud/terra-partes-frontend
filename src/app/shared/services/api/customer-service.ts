import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {map, Observable} from 'rxjs';
import {api_response} from '../../models/common/response.model';
import {customer_list_response} from '../../models/api/response/customer-list-response.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/customers`;

  // obtiene lista de clientes
  get_customers(): Observable<customer_list_response[]> {
    return this.http.get<api_response<customer_list_response[]>>(this.api_url).pipe(
      map(response => response.data)
    );
  }
}
