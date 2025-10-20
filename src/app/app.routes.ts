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
          import('./pages/layout/pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'order/create',
        loadComponent: () =>
          import('./pages/layout/pages/order/order-create/order-create').then(m => m.OrderCreate)
      },
      {
        path: 'quotation/create',
        loadComponent: () =>
          import('./pages/layout/pages/quotation/quotation-create/quotation-create').then(m => m.QuotationCreate)
      },
      {
        path: 'purchase/create',
        loadComponent: () =>
          import('./pages/layout/pages/purchase/purchase-create/purchase-create').then(m => m.PurchaseCreate)
      }
    ]
  },
  {path: '**', redirectTo: ''}
];
