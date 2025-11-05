import {Routes} from '@angular/router';
import {Login} from './pages/login/login';
import {Layout} from './pages/layout/layout';
import {authGuard} from './core/guards/auth-guard';

export const routes: Routes = [
  {path: 'login', component: Login},
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/layout/pages/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'order/create',
        loadComponent: () =>
          import('./pages/layout/pages/order/order-create/order-create').then(
            m => m.OrderCreate,
          ),
      },
      {
        path: 'order/select-product',
        loadComponent: () =>
          import('./pages/layout/pages/order/order-select-product/order-select-product')
            .then(m => m.OrderSelectProduct),
      },
    ],
  },
  {
    path: 'order/print',
    loadComponent: () =>
      import('./pages/layout/pages/order/order-print/order-print').then(
        m => m.OrderPrint
      ),
  },
  {path: '**', redirectTo: ''},
];
