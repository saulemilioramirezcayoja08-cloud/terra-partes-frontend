import {Component} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {filter} from 'rxjs';
import {AuthService} from '../../../../modules/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  currentUrl: string = '';

  private readonly routeMap = {
    ventas: ['/quotation', '/order', '/sale', '/credit', '/payments', '/reservas'],
    inventario: ['/inventory'],
    compras: ['/purchase'],
    proveedores: ['/supplier'],
    catalogo: ['/catalog'],
    reportes: ['/report'],
    clientes: ['/customers'],
    documentos: ['/documents'],
    administracion: ['/admin']
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      });

    this.currentUrl = this.router.url;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get userInitials(): string {
    const user = this.currentUser;
    if (!user?.name) return '??';
    
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  isModuleActive(module: keyof typeof this.routeMap): boolean {
    const routes = this.routeMap[module];
    return routes.some(route => this.currentUrl.startsWith(route));
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}