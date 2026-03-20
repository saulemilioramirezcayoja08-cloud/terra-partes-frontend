import {CanActivateFn, Router} from '@angular/router';
import {inject, PLATFORM_ID} from '@angular/core';
import {LoginService} from '../../auth/pages/login/services/login-service';
import {isPlatformBrowser} from '@angular/common';
import {PermissionService} from '../services/static/permission-service';

export const roleGuard: CanActivateFn = (route) => {
  // dependencias
  const login_service = inject(LoginService);
  const permission_service = inject(PermissionService);
  const router = inject(Router);
  const platform_id = inject(PLATFORM_ID);

  // en SSR permite paso, el browser validara despues
  if (!isPlatformBrowser(platform_id)) {
    return true;
  }

  // verifica sesion activa
  const user = login_service.get_user();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // lee la clave de ruta desde data
  const route_key: string = route.data['route_key'] ?? '';

  // si no se define route_key, solo requiere autenticacion
  if (!route_key) {
    return true;
  }

  // verifica acceso via permission service
  if (permission_service.can_access_route(route_key)) {
    return true;
  }

  // sin permiso, redirige a dashboard
  router.navigate(['/layout/dashboard']);
  return false;
};
