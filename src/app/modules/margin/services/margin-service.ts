import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MarginReportResponse } from '../get/models/margin-report-response.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarginService {
  private readonly apiUrl = `${environment.apiBaseUrl}/margins`;

  constructor(private http: HttpClient) { }

  getMarginReport(
    params?: {
      sku?: string;
      username?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<ApiResponse<MarginReportResponse>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<MarginReportResponse>>(
      `${this.apiUrl}/report`,
      { params: httpParams }
    );
  }
}