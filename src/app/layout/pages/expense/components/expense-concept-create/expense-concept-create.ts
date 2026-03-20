import { Component, computed, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Breadcrumb, breadcrumb_item } from '../../../../../shared/components/breadcrumb/breadcrumb';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../../../shared/services/api/user-service';
import { ExpenseService } from '../../services/expense-service';
import { ContextFormService } from '../../../../../shared/services/context-form-service';
import { user_list_response } from '../../../../../shared/models/api/response/user-list-response.model';
import { expense_concept_create_response } from '../../models/response/expense-concept-create-response.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-expense-concept-create',
  imports: [Breadcrumb, FormsModule],
  templateUrl: './expense-concept-create.html',
  styleUrl: './expense-concept-create.css',
})
export class ExpenseConceptCreate implements OnInit {
  // dependencias
  private platform_id = inject(PLATFORM_ID);
  private router = inject(Router);
  private user_service = inject(UserService);
  private expense_service = inject(ExpenseService);
  private context_form_service = inject(ContextFormService);

  // contexto
  private readonly context = 'expense_concept';

  // catalogos
  protected users = signal<user_list_response[]>([]);

  // ultimo concepto creado
  protected last_concept = signal<expense_concept_create_response | null>(null);

  // campos del formulario
  protected selected_user = signal<number | null>(null);
  protected name = signal<string>('');
  protected description = signal<string>('');
  protected loading = signal<boolean>(false);

  // estado de dropdowns
  protected open_user_dropdown = signal<boolean>(false);

  // breadcrumb
  protected breadcrumb_items = signal<breadcrumb_item[]>([
    { label: 'Egresos' },
    { label: 'Conceptos' },
    { label: 'Crear', active: true }
  ]);

  // computados
  protected has_last_concept = computed(() => this.last_concept() !== null);

  protected is_valid_form = computed(() => {
    return this.selected_user() !== null &&
      this.name().trim() !== '';
  });

  protected selected_user_name = computed(() => {
    const id = this.selected_user();
    if (!id) return 'Seleccionar usuario...';
    return this.users().find(u => u.id === id)?.name ?? 'Seleccionar usuario...';
  });

  @HostListener('document:click', ['$event'])
  on_document_click(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.open_user_dropdown.set(false);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platform_id)) {
      this.load_users();
      this.load_form_from_service();
    }
  }

  // carga todos los usuarios
  private load_users(): void {
    this.user_service.get_users().subscribe({
      next: (response) => this.users.set(response),
      error: (err) => console.error(err.error)
    });
  }

  // carga datos del formulario desde el servicio
  private load_form_from_service(): void {
    const data = this.context_form_service.get_expense_concept_data(this.context);
    this.selected_user.set(data.form.user_id);
    this.name.set(data.form.name);
    this.description.set(data.form.description);
    this.last_concept.set(data.last_expense_concept);
  }

  // guarda datos del formulario al servicio
  private save_form_to_service(): void {
    this.context_form_service.update_expense_concept_form(this.context, {
      user_id: this.selected_user(),
      name: this.name(),
      description: this.description()
    });
  }

  // toggle dropdown
  protected toggle_user_dropdown(): void {
    this.open_user_dropdown.update(v => !v);
  }

  // seleccion de usuario
  protected on_user_select(user_id: number): void {
    this.selected_user.set(user_id);
    this.open_user_dropdown.set(false);
    this.save_form_to_service();
  }

  // limpia formulario
  protected on_cancel(): void {
    this.context_form_service.clear_expense_concept(this.context);
    this.load_form_from_service();
  }

  // guarda concepto
  protected on_save(): void {
    if (!this.is_valid_form()) return;

    this.loading.set(true);
    this.save_form_to_service();

    const request = {
      user_id: this.selected_user()!,
      name: this.name().trim(),
      description: this.description().trim() || null
    };

    this.expense_service.create_concept(request).subscribe({
      next: (response) => {
        this.context_form_service.set_last_expense_concept(this.context, response);
        this.last_concept.set(response);
        this.loading.set(false);

        // limpia formulario pero mantiene last_concept
        this.context_form_service.update_expense_concept_form(this.context, {
          user_id: null,
          name: '',
          description: ''
        });
        this.load_form_from_service();
      },
      error: (err) => {
        const message = err.error?.message;
        alert(message);
        this.loading.set(false);
      }
    });
  }

  // navega a vista previa
  protected on_preview(): void {
    this.router.navigate(['/layout/expenses/concepts/preview']);
  }
}
