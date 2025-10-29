import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {LoginResponse} from '../models/login-response.model';
import {LoginRequest} from '../models/login-request.model';
import {ApiResponse} from '../../../core/models/api-response.model';
import {environment} from '../../../environments/environment';

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

  logout(): void {
    this._currentUser = null;
  }

  isAuthenticated(): boolean {
    return this._currentUser !== null && this._currentUser.isActive;
  }
}
