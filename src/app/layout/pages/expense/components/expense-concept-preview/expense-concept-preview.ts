import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { Router } from '@angular/router';
import { ContextFormService } from '../../../../../shared/services/context-form-service';
import { expense_concept_create_response } from '../../models/response/expense-concept-create-response.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-expense-concept-preview',
  imports: [Breadcrumb],
  templateUrl: './expense-concept-preview.html',
  styleUrl: './expense-concept-preview.css',
})
export class ExpenseConceptPreview implements OnInit {
  // dependencias
  private router = inject(Router);
  private platform_id = inject(PLATFORM_ID);
  private context_form_service = inject(ContextFormService);

  // contexto
  private readonly context = 'expense_concept';

  // datos del concepto
  protected concept = signal<expense_concept_create_response | null>(null);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Egresos' },
    { label: 'Conceptos' },
    { label: 'Vista Previa', active: true }
  ]);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_concept();
    }
  }

  // carga concepto desde servicio
  private load_concept(): void {
    const last = this.context_form_service.get_last_expense_concept(this.context);
    if (last) {
      this.concept.set(last);
    } else {
      this.router.navigate(['/layout/expenses/concepts/create']);
    }
  }

  // vuelve atras
  protected go_back(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/layout/expenses/concepts/create']);
    }
  }

  // formateo
  protected format_datetime(date: string): string {
    return new Date(date).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}