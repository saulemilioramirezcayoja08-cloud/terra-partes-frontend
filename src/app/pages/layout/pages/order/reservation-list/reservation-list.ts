import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../../../modules/order/services/reservation-service';
import { ReservationListResponse } from '../../../../../modules/order/get/models/reservation-list-response.model';

@Component({
  selector: 'app-reservation-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.css'
})
export class ReservationList implements OnInit {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = signal<ReservationListResponse[]>([]);
  readonly selectedReservation = signal<ReservationListResponse | null>(null);
  readonly usernameSearch = signal('');
  readonly selectedStatus = signal<'ACTIVE' | 'CONSUMED' | null>(null);
  readonly isLoading = signal(false);

  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly hasNext = signal(false);
  readonly hasPrevious = signal(false);

  readonly paginationInfo = computed(() =>
    `Mostrando ${this.reservations().length} de ${this.totalElements()} reservas`
  );

  readonly pageInfo = computed(() =>
    `Página ${this.currentPage() + 1} de ${this.totalPages()}`
  );

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading.set(true);
    const params: any = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    if (this.selectedStatus()) {
      params.status = this.selectedStatus();
    }

    const username = this.usernameSearch().trim();
    if (username) {
      params.username = username;
    }

    this.reservationService.getReservations(params).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.reservations.set(data.content);
          this.currentPage.set(data.page);
          this.totalElements.set(data.totalElements);
          this.totalPages.set(data.totalPages);
          this.hasNext.set(data.hasNext);
          this.hasPrevious.set(data.hasPrevious);

          if (data.content.length > 0 && !this.selectedReservation()) {
            this.selectReservation(data.content[0]);
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onEnter(): void {
    this.currentPage.set(0);
    this.loadReservations();
  }

  toggleStatus(status: 'ACTIVE' | 'CONSUMED'): void {
    this.selectedStatus.set(this.selectedStatus() === status ? null : status);
    this.currentPage.set(0);
    this.loadReservations();
  }

  selectReservation(reservation: ReservationListResponse): void {
    this.selectedReservation.set(reservation);
  }

  nextPage(): void {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.loadReservations();
    }
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.loadReservations();
    }
  }

  formatBolivianDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
    } catch (error) {
      return isoDate;
    }
  }

  trackByReservationId(_: number, reservation: ReservationListResponse): number {
    return reservation.id;
  }
}