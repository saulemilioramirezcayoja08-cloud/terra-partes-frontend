import {Component} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {filter} from 'rxjs';

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
    compras: ['/purchase', '/suppliers'],
    catalogo: ['/catalog'],
    reportes: ['/report'],
    clientes: ['/customers'],
    documentos: ['/documents'],
    administracion: ['/admin']
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
      });

    this.currentUrl = this.router.url;
  }

  isModuleActive(module: keyof typeof this.routeMap): boolean {
    const routes = this.routeMap[module];
    return routes.some(route => this.currentUrl.startsWith(route));
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
  }
}
