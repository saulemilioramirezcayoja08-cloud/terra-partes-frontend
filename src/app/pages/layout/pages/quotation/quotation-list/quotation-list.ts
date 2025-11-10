import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuotationService } from '../../../../../modules/quotation/services/quotation.service';
import { QuotationListResponse } from '../../../../../modules/quotation/get/models/quotation-list-response.model';

@Component({
  selector: 'app-quotation-list',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './quotation-list.html',
  styleUrl: './quotation-list.css'
})
export class QuotationList implements OnInit, OnDestroy {
  private readonly quotationService = inject(QuotationService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly quotations = signal<QuotationListResponse[]>([]);
  readonly selectedQuotation = signal<QuotationListResponse | null>(null);
  readonly searchTerm = signal('');
  readonly searchMode = signal<'number' | 'username'>('number');
  readonly isLoading = signal(false);
  readonly activeDropdown = signal<number | null>(null);

  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly hasNext = signal(false);
  readonly hasPrevious = signal(false);

  readonly paginationInfo = computed(() =>
    `Mostrando ${this.quotations().length} de ${this.totalElements()} cotizaciones`
  );

  readonly pageInfo = computed(() =>
    `Página ${this.currentPage() + 1} de ${this.totalPages()}`
  );

  private activeFilters: { number?: string; username?: string } = {};
  private clickListener?: (event: Event) => void;

  ngOnInit(): void {
    this.loadQuotations();
    if (this.isBrowser) {
      this.clickListener = this.handleClickOutside.bind(this);
      document.addEventListener('click', this.clickListener);
    }
  }

  ngOnDestroy(): void {
    if (this.clickListener && this.isBrowser) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  loadQuotations(): void {
    this.isLoading.set(true);

    this.quotationService.getQuotations({
      ...this.activeFilters,
      page: this.currentPage(),
      size: this.pageSize()
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.quotations.set(response.data.content);
          this.totalElements.set(response.data.totalElements);
          this.totalPages.set(response.data.totalPages);
          this.hasNext.set(response.data.hasNext);
          this.hasPrevious.set(response.data.hasPrevious);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        alert('Error al cargar cotizaciones: ' + (error.message || 'Error desconocido'));
        this.isLoading.set(false);
      }
    });
  }

  selectQuotation(quotation: QuotationListResponse): void {
    this.selectedQuotation.set(quotation);
  }

  onEnter(): void {
    const term = this.searchTerm().trim();
    if (!term) {
      this.clearFilters();
      return;
    }

    this.currentPage.set(0);
    if (this.searchMode() === 'number') {
      this.activeFilters = { number: term };
    } else {
      this.activeFilters = { username: term };
    }
    this.loadQuotations();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.activeFilters = {};
    this.currentPage.set(0);
    this.loadQuotations();
  }

  switchSearchMode(): void {
    this.searchMode.set(this.searchMode() === 'number' ? 'username' : 'number');
    this.searchTerm.set('');
    this.clearFilters();
  }

  nextPage(): void {
    if (this.hasNext()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadQuotations();
    }
  }

  previousPage(): void {
    if (this.hasPrevious()) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadQuotations();
    }
  }

  toggleDropdown(quotationId: number, event: Event): void {
    event.stopPropagation();
    this.activeDropdown.set(
      this.activeDropdown() === quotationId ? null : quotationId
    );
  }

  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-trigger') && !target.closest('.dropdown-menu')) {
      this.activeDropdown.set(null);
    }
  }

  formatBolivianDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();

      const bolivianDate = new Date(Date.UTC(year, month, day, hours, minutes));
      bolivianDate.setHours(bolivianDate.getHours());

      const dd = String(bolivianDate.getDate()).padStart(2, '0');
      const mm = String(bolivianDate.getMonth() + 1).padStart(2, '0');
      const yyyy = bolivianDate.getFullYear();
      const hh = String(bolivianDate.getHours()).padStart(2, '0');
      const min = String(bolivianDate.getMinutes()).padStart(2, '0');

      return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
    } catch (error) {
      return isoDate;
    }
  }

  trackByQuotationId(_: number, quotation: QuotationListResponse): number {
    return quotation.id;
  }
}