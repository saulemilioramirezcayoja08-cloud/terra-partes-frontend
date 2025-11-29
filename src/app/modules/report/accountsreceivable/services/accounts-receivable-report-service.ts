import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { AccountsReceivableReportResponse } from '../models/accounts-receivable-report-response.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsReceivableReportService {
  private readonly apiUrl = `${environment.apiBaseUrl}/reports/accounts-receivable`;

  constructor(private http: HttpClient) {}

  getAccountsReceivableReport(params?: {
    customerId?: number;
    startDate?: string;
    endDate?: string;
    paymentId?: number;
  }): Observable<ApiResponse<AccountsReceivableReportResponse>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<AccountsReceivableReportResponse>>(
      this.apiUrl,
      { params: httpParams }
    );
  }
}
