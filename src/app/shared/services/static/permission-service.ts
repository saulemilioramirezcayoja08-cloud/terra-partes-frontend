import { inject, Injectable } from '@angular/core';
import { LoginService } from '../../../auth/pages/login/services/login-service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  // dependencias
  private login_service = inject(LoginService);

  // capa 1: acceso a seccion completa (sidebar)
  private readonly module_access: Record<string, string[]> = {
    'dashboard': ['ADMIN', 'VENDEDOR'],
    'products': ['ADMIN', 'VENDEDOR'],
    'quotations': ['ADMIN', 'VENDEDOR'],
    'orders': ['ADMIN', 'VENDEDOR'],
    'customers': ['ADMIN', 'VENDEDOR'],
    'sales': ['ADMIN'],
    'purchases': ['ADMIN'],
    'suppliers': ['ADMIN'],
    'inventories': ['ADMIN'],
    'reports': ['ADMIN'],
    'expenses': ['ADMIN'],
    'incomes': ['ADMIN'],
  };

  // capa 2: acceso a rutas especificas dentro de una seccion
  private readonly route_access: Record<string, string[]> = {
    // products
    'products': ['ADMIN', 'VENDEDOR'],
    'products.create': ['ADMIN'],
    // quotations
    'quotations': ['ADMIN', 'VENDEDOR'],
    // orders
    'orders': ['ADMIN', 'VENDEDOR'],
    // customers
    'customers': ['ADMIN', 'VENDEDOR'],
    // sales
    'sales': ['ADMIN'],
    // purchases
    'purchases': ['ADMIN'],
    // suppliers
    'suppliers': ['ADMIN'],
    // inventories
    'inventories': ['ADMIN'],
    // reports
    'reports': ['ADMIN'],
    // expenses
    'expenses': ['ADMIN'],
    // incomes
    'incomes': ['ADMIN'],
  };

  // retorna el codigo del rol actual
  get_role(): string {
    return this.login_service.get_user()?.role?.code || '';
  }

  // capa 1: determina si puede ver la seccion en el sidebar
  can_access(module: string): boolean {
    const allowed = this.module_access[module] ?? [];
    return allowed.includes(this.get_role());
  }

  // capa 2: determina si puede acceder a una ruta especifica
  can_access_route(route_key: string): boolean {
    const allowed = this.route_access[route_key] ?? [];
    return allowed.includes(this.get_role());
  }

  // retorna el user_id del usuario logueado
  get_current_user_id(): number | null {
    return this.login_service.get_user()?.id || null;
  }
}