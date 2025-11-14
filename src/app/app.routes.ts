import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './pages/layout/layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
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
        path: 'order/list',
        loadComponent: () =>
          import('./pages/layout/pages/order/order-list/order-list').then(
            m => m.OrderList,
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
        path: 'quotation/list',
        loadComponent: () =>
          import('./pages/layout/pages/quotation/quotation-list/quotation-list').then(
            m => m.QuotationList,
          ),
      },
      {
        path: 'quotation/select-product',
        loadComponent: () =>
          import('./pages/layout/pages/quotation/quotation-select-product/quotation-select-product')
            .then(m => m.QuotationSelectProduct),
      },
      {
        path: 'purchase/create',
        loadComponent: () =>
          import('./pages/layout/pages/purchase/purchase-create/purchase-create').then(
            m => m.PurchaseCreate,
          ),
      },
      {
        path: 'purchase/select-product',
        loadComponent: () =>
          import('./pages/layout/pages/purchase/purchase-select-product/purchase-select-product')
            .then(m => m.PurchaseSelectProduct),
      },
      {
        path: 'product/list',
        loadComponent: () =>
          import('./pages/layout/pages/catalog/product-list/product-list')
            .then(m => m.ProductList),
      },
      {
        path: 'product/create',
        loadComponent: () =>
          import('./pages/layout/pages/catalog/product-create/product-create')
            .then(m => m.ProductCreate),
      },
      {
        path: 'sale/list',
        loadComponent: () =>
          import('./pages/layout/pages/sale/sale-list/sale-list').then(
            m => m.SaleList,
          ),
      },
      {
        path: 'sale/confirmed-list',
        loadComponent: () =>
          import('./pages/layout/pages/sale/sale-confirmed-list/sale-confirmed-list').then(
            m => m.SaleConfirmedList,
          ),
      },
      {
        path: 'purchase/list',
        loadComponent: () =>
          import('./pages/layout/pages/purchase/purchase-list/purchase-list').then(
            m => m.PurchaseList,
          ),
      },
      {
        path: 'purchase/confirmed-list',
        loadComponent: () =>
          import('./pages/layout/pages/purchase/purchase-confirmed-list/purchase-confirmed-list').then(
            m => m.PurchaseConfirmedList,
          ),
      },
      {
        path: 'customer/create',
        loadComponent: () =>
          import('./pages/layout/pages/customer/customer-create/customer-create').then(
            m => m.CustomerCreate,
          ),
      },
      {
        path: 'customer/list',
        loadComponent: () =>
          import('./pages/layout/pages/customer/customer-list/customer-list').then(
            m => m.CustomerList,
          ),
      },
      {
        path: 'supplier/create',
        loadComponent: () =>
          import('./pages/layout/pages/supplier/supplier-create/supplier-create').then(
            m => m.SupplierCreate,
          ),
      },
      {
        path: 'supplier/list',
        loadComponent: () =>
          import('./pages/layout/pages/supplier/supplier-list/supplier-list').then(
            m => m.SupplierList,
          ),
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
    path: 'order/reprint',
    loadComponent: () =>
      import('./pages/layout/pages/order/order-reprint/order-reprint').then(
        m => m.OrderReprint
      ),
  },
  {
    path: 'quotation/print',
    loadComponent: () =>
      import('./pages/layout/pages/quotation/quotation-print/quotation-print').then(
        m => m.QuotationPrint
      ),
  },
  {
    path: 'quotation/reprint',
    loadComponent: () =>
      import('./pages/layout/pages/quotation/quotation-reprint/quotation-reprint')
        .then(m => m.QuotationReprint),
  },
  {
    path: 'purchase/print',
    loadComponent: () =>
      import('./pages/layout/pages/purchase/purchase-print/purchase-print').then(
        m => m.PurchasePrint
      ),
  },
  {
    path: 'purchase/reprint',
    loadComponent: () =>
      import('./pages/layout/pages/purchase/purchase-reprint/purchase-reprint')
        .then(m => m.PurchaseReprint),
  },
  {
    path: 'sale/reprint',
    loadComponent: () =>
      import('./pages/layout/pages/sale/sale-reprint/sale-reprint')
        .then(m => m.SaleReprint),
  },
  { path: '**', redirectTo: '' },
];
