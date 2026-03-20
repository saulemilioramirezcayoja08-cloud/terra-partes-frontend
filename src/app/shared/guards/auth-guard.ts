import {CanActivateFn, Router} from '@angular/router';
import {inject, PLATFORM_ID} from '@angular/core';
import {LoginService} from '../../auth/pages/login/services/login-service';
import {isPlatformBrowser} from '@angular/common';

export const authGuard: CanActivateFn = () => {
  // dependencias
  const login_service = inject(LoginService);
  const router = inject(Router);
  const platform_id = inject(PLATFORM_ID);

  // en SSR permite paso, el browser validara despues
  if (!isPlatformBrowser(platform_id)) {
    return true;
  }

  // verifica si hay sesion activa
  if (login_service.is_logged_in()) {
    // permite acceso a la ruta
    return true;
  }

  // no autenticado, redirige a login
  router.navigate(['/login']);
  return false;
};
