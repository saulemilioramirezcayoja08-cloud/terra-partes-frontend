import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response.model';
import { StockListResponse } from '../get/models/stock-list-response.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly apiUrl = `${environment.apiBaseUrl}/inventory`;

  constructor(private http: HttpClient) {
  }

  getStock(
    params?: {
      warehouseCode?: string;
      productSku?: string;
    }
  ): Observable<ApiResponse<StockListResponse[]>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<StockListResponse[]>>(
      `${this.apiUrl}/stock`,
      {params: httpParams}
    );
  }
}