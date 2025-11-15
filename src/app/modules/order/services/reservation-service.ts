import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../core/models/page-response.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ReservationListResponse } from '../get/models/reservation-list-response.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly apiUrl = `${environment.apiBaseUrl}/reservations`;

  constructor(private http: HttpClient) {
  }

  getReservations(
    params?: {
      status?: string;
      username?: string;
      page?: number;
      size?: number;
    }
  ): Observable<ApiResponse<PageResponse<ReservationListResponse>>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PageResponse<ReservationListResponse>>>(
      this.apiUrl,
      {params: httpParams}
    );
  }
}