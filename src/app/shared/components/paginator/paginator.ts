import {Component, computed, input, output} from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
})
export class Paginator {
  // inputs requeridos
  current_page = input.required<number>();
  page_size = input.required<number>();
  total_items = input.required<number>();

  // outputs
  page_change = output<number>();

  // calcula total de paginas
  protected total_pages = computed(() =>
    Math.ceil(this.total_items() / this.page_size())
  );

  // calcula item inicial mostrado
  protected start_item = computed(() =>
    (this.current_page() - 1) * this.page_size() + 1
  );

  // calcula item final mostrado
  protected end_item = computed(() =>
    Math.min(this.current_page() * this.page_size(), this.total_items())
  );

  // verifica si puede ir a pagina anterior
  protected can_go_previous = computed(() => this.current_page() > 1);

  // verifica si puede ir a pagina siguiente
  protected can_go_next = computed(() => this.current_page() < this.total_pages());

  // navega a pagina anterior
  protected on_previous(): void {
    if (this.can_go_previous()) {
      this.page_change.emit(this.current_page() - 1);
    }
  }

  // navega a pagina siguiente
  protected on_next(): void {
    if (this.can_go_next()) {
      this.page_change.emit(this.current_page() + 1);
    }
  }
}
