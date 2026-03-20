import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {map, Observable} from 'rxjs';
import {api_response} from '../../models/common/response.model';
import {payment_method_list_response} from '../../models/api/response/payment-method-list-response.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/payment-methods`;

  // obtiene lista de metodos de pago
  get_payment_methods(): Observable<payment_method_list_response[]> {
    return this.http.get<api_response<payment_method_list_response[]>>(this.api_url).pipe(
      map(response => response.data)
    );
  }
}
