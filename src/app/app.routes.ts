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
      {
        path: 'quotation/create',
        loadComponent: () =>
          import('./pages/layout/pages/quotation/quotation-create/quotation-create').then(
            m => m.QuotationCreate,
          ),
      },
      {
        path: 'quotation/select-product',
        loadComponent: () =>
          import('./pages/layout/pages/quotation/quotation-select-product/quotation-select-product')
            .then(m => m.QuotationSelectProduct),
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
  {
    path: 'quotation/print',
    loadComponent: () =>
      import('./pages/layout/pages/quotation/quotation-print/quotation-print').then(
        m => m.QuotationPrint
      ),
  },
  {path: '**', redirectTo: ''},
];
