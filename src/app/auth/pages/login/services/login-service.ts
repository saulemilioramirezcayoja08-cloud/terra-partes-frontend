import {inject, Injectable, PLATFORM_ID, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {login_response} from '../models/response/login.response';
import {isPlatformBrowser} from '@angular/common';
import {login_request} from '../models/request/login.request';
import {map, Observable} from 'rxjs';
import {api_response} from '../../../../shared/models/common/response.model';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  // dependencias
  private http = inject(HttpClient);
  private platform_id = inject(PLATFORM_ID);

  // configuracion
  private api_url = `${environment.api_url}/auth`;
  private storage_key = 'current_user';

  // estado
  private current_user = signal<login_response | null>(null);
  private initialized = false;

  // inicializa usuario desde localStorage
  private init_from_storage(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (isPlatformBrowser(this.platform_id)) {
      const stored = localStorage.getItem(this.storage_key);
      if (stored) {
        this.current_user.set(JSON.parse(stored));
      }
    }
  }

  // guarda usuario en localStorage
  private save_to_storage(user: login_response | null): void {
    if (!isPlatformBrowser(this.platform_id)) return;

    if (user) {
      localStorage.setItem(this.storage_key, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.storage_key);
    }
  }

  // autentica usuario con credenciales
  login(credentials: login_request): Observable<login_response | null> {
    return this.http.post<api_response<login_response>>(`${this.api_url}/login`, credentials).pipe(
      map(response => {
        if (response.success && response.data) {
          this.current_user.set(response.data);
          this.save_to_storage(response.data);
          return response.data;
        }
        return null;
      })
    );
  }

  // cierra sesion y limpia storage
  logout(): void {
    this.current_user.set(null);
    this.save_to_storage(null);
  }

  // retorna usuario actual
  get_user(): login_response | null {
    this.init_from_storage();
    return this.current_user();
  }

  // verifica si hay sesion activa
  is_logged_in(): boolean {
    this.init_from_storage();
    return this.current_user() !== null;
  }
}
