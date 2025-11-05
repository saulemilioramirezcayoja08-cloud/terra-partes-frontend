import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {ApiResponse} from '../../../core/models/api-response.model';
import {environment} from '../../../environments/environment';
import {LoginResponse} from '../post/models/login-response.model';
import {LoginRequest} from '../post/models/login-request.model';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser: LoginResponse | null = null;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'current_user';

  get currentUser(): LoginResponse | null {
    return this._currentUser;
  }

  set currentUser(user: LoginResponse | null) {
    this._currentUser = user;
    if (isPlatformBrowser(this.platformId)) {
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem(this.STORAGE_KEY);
      if (storedUser) {
        try {
          this._currentUser = JSON.parse(storedUser);
        } catch (error) {
          console.error('Error al parsear usuario almacenado', error);
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    }
  }

  login(payload: LoginRequest): Observable<HttpResponse<ApiResponse<LoginResponse>>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiBaseUrl}/auth/login`,
      payload,
      {observe: 'response'}
    ).pipe(
      tap(response => {
        if (response.body?.success && response.body?.data) {
          this.currentUser = response.body.data;
        }
      })
    );
  }

  logout(): void {
    this.currentUser = null;
  }
}
