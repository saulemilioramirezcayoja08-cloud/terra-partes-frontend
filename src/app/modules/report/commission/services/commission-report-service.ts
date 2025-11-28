import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { CommissionReportResponse } from '../models/commission-report-response.model';

@Injectable({
  providedIn: 'root'
})
export class CommissionReportService {
  private readonly apiUrl = `${environment.apiBaseUrl}/reports/commissions`;

  constructor(private http: HttpClient) {}

  getCommissionsReport(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: number;
  }): Observable<ApiResponse<CommissionReportResponse>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<CommissionReportResponse>>(
      this.apiUrl,
      { params: httpParams }
    );
  }
}