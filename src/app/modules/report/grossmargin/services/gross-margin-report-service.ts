import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { GrossMarginReportResponse } from '../models/gross-margin-report-response.model';

@Injectable({
  providedIn: 'root'
})
export class GrossMarginReportService {
  private readonly apiUrl = `${environment.apiBaseUrl}/reports/gross-margin`;

  constructor(private http: HttpClient) {}

  getGrossMarginReport(params?: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
    userId?: number;
    paymentId?: number;
  }): Observable<ApiResponse<GrossMarginReportResponse>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<GrossMarginReportResponse>>(
      this.apiUrl,
      { params: httpParams }
    );
  }
}