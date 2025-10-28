import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {LoginResponse} from '../models/login-response.model';
import {ApiResponse} from '../models/api-response.model';
import {LoginRequest} from '../models/login-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser: LoginResponse | null = null;

  get currentUser(): LoginResponse | null {
    return this._currentUser;
  }

  set currentUser(u: LoginResponse | null) {
    this._currentUser = u;
  }

  constructor(private http: HttpClient) {
  }

  login(payload: LoginRequest): Observable<HttpResponse<ApiResponse<LoginResponse>>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiBaseUrl}/auth/login`,
      payload,
      {observe: 'response'}
    );
  }

  logout() {
    this._currentUser = null;
  }
}
