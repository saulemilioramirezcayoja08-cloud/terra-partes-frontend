import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {map, Observable} from 'rxjs';
import {api_response} from '../../models/common/response.model';
import {user_list_response} from '../../models/api/response/user-list-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/users`;

  // obtiene lista de usuarios
  get_users(): Observable<user_list_response[]> {
    return this.http.get<api_response<user_list_response[]>>(this.api_url).pipe(
      map(response => response.data)
    );
  }
}
