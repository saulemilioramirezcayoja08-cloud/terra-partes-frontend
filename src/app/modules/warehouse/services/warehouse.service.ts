import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from '../../../core/models/api-response.model';
import {PageResponse} from '../../../core/models/page-response.model';
import {WarehouseListResponse} from '../get/models/warehouse-list-response.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private readonly apiUrl = `${environment.apiBaseUrl}/warehouses`;

  constructor(private http: HttpClient) {
  }

  getWarehouses(
    params?: {
      code?: string;
      name?: string;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<WarehouseListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<WarehouseListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }
}
