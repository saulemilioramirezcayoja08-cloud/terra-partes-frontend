import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GrossMarginReportResponse } from '../get/models/gross-margin-report-response.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = `${environment.apiBaseUrl}/reports`;

  constructor(private http: HttpClient) {}

  getGrossMarginReport(
    params: {
      startDate: string;
      endDate: string;
    }
  ): Observable<ApiResponse<GrossMarginReportResponse>> {
    let httpParams = new HttpParams()
      .set('startDate', params.startDate)
      .set('endDate', params.endDate);

    return this.http.get<ApiResponse<GrossMarginReportResponse>>(
      `${this.apiUrl}/gross-margin`,
      { params: httpParams }
    );
  }
}