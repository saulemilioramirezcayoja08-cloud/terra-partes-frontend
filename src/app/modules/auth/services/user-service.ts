import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PageResponse } from '../../../core/models/page-response.model';
import { UserListResponse } from '../get/models/user-list-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(
    params?: {
      username?: string;
      email?: string;
      name?: string;
      isActive?: boolean;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<UserListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<UserListResponse>>>(
      this.apiUrl,
      { params: httpParams }
    );
  }
}