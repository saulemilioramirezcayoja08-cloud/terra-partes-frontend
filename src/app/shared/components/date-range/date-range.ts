import {Component, input, output, signal} from '@angular/core';

@Component({
  selector: 'app-date-range',
  imports: [],
  templateUrl: './date-range.html',
  styleUrl: './date-range.css',
})
export class DateRange {
  // inputs configurables
  label_from = input<string>('Fecha Desde');
  label_to = input<string>('Fecha Hasta');

  // estado interno
  protected date_from = signal<string | null>(null);
  protected date_to = signal<string | null>(null);

  // output del rango
  range_change = output<{ from: string | null; to: string | null }>();

  // maneja cambio en fecha desde
  protected on_from_change(event: Event): void {
    const value = (event.target as HTMLInputElement).value || null;
    this.date_from.set(value);
    this.emit_change();
  }

  // maneja cambio en fecha hasta
  protected on_to_change(event: Event): void {
    const value = (event.target as HTMLInputElement).value || null;
    this.date_to.set(value);
    this.emit_change();
  }

  // emite el cambio
  private emit_change(): void {
    this.range_change.emit({
      from: this.date_from(),
      to: this.date_to()
    });
  }
}
