import {Component, inject, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {LoginService} from '../auth/pages/login/services/login-service';
import {Sidebar} from './components/sidebar/sidebar';

@Component({
  selector: 'app-layout',
  imports: [
    Sidebar,
    RouterOutlet
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  // dependencias
  private router = inject(Router);
  protected login_service = inject(LoginService);

  // estado del sidebar
  protected sidebar_collapsed = signal(false);

  // alterna estado del sidebar
  protected toggle_sidebar(): void {
    // invierte el valor actual
    this.sidebar_collapsed.update(value => !value);
  }

  // cierra sesion
  protected on_logout(): void {
    // limpia sesion
    this.login_service.logout();

    // redirige a login
    this.router.navigate(['/login']);
  }
}
