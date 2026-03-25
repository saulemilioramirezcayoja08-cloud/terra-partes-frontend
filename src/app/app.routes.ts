import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth-guard';
import { roleGuard } from './shared/guards/role-guard-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/pages/login/components/login/login').then(m => m.Login)
  },
  {
    path: 'print',
    children: [
      {
        path: 'quotations/:id',
        loadComponent: () => import('./print/pages/quotation-print/quotation-print').then(m => m.QuotationPrint)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./print/pages/order-print/order-print').then(m => m.OrderPrint)
      },
      {
        path: 'purchases/:id',
        loadComponent: () => import('./print/pages/purchase-print/purchase-print').then(m => m.PurchasePrint)
      },
      {
        path: 'sales/:id',
        loadComponent: () => import('./print/pages/sale-print/sale-print').then(m => m.SalePrint)
      }
    ]
  },
  {
    path: 'layout',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./layout/pages/dashboard/dashboard').then(m => m.Dashboard)
      },

      // products
      {
        path: 'products',
        canActivate: [roleGuard],
        data: { route_key: 'products' },
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./layout/pages/product/components/product-list/product-list').then(m => m.ProductList)
          },
          {
            path: 'create',
            canActivate: [roleGuard],
            data: { route_key: 'products.create' },
            loadComponent: () => import('./layout/pages/product/components/product-create/product-create').then(m => m.ProductCreate)
          },
          {
            path: 'preview',
            loadComponent: () => import('./layout/pages/product/components/product-preview/product-preview').then(m => m.ProductPreview)
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./layout/pages/product/components/product-preview/product-preview').then(m => m.ProductPreview)
          },
          {
            path: 'products',
            loadComponent: () => import('./layout/pages/product/components/product-selection/product-selection').then(m => m.ProductSelection),
            data: { context: 'product', return_route: '/layout/products/list' }
          }
        ]
      },

      // quotations
      {
        path: 'quotations',
        canActivate: [roleGuard],
        data: { route_key: 'quotations' },
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./layout/pages/quotation/components/quotation-list/quotation-list').then(m => m.QuotationList)
          },
          {
            path: 'create',
            loadComponent: () => import('./layout/pages/quotation/components/quotation-create/quotation-create').then(m => m.QuotationCreate)
          },
          {
            path: 'preview',
            loadComponent: () => import('./layout/pages/quotation/components/quotation-preview/quotation-preview').then(m => m.QuotationPreview)
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./layout/pages/quotation/components/quotation-preview/quotation-preview').then(m => m.QuotationPreview)
          },
          {
            path: 'products',
            loadComponent: () => import('./layout/pages/product/components/product-selection/product-selection').then(m => m.ProductSelection),
            data: { context: 'quotation', return_route: '/layout/quotations/create' }
          }
        ]
      },

      // orders
      {
        path: 'orders',
        canActivate: [roleGuard],
        data: { route_key: 'orders' },
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./layout/pages/order/components/order-list/order-list').then(m => m.OrderList)
          },
          {
            path: 'create',
            loadComponent: () => import('./layout/pages/order/components/order-create/order-create').then(m => m.OrderCreate)
          },
          {
            path: 'preview',
            loadComponent: () => import('./layout/pages/order/components/order-preview/order-preview').then(m => m.OrderPreview)
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./layout/pages/order/components/order-preview/order-preview').then(m => m.OrderPreview)
          },
          {
            path: ':id/payments',
            loadComponent: () => import('./layout/pages/order/components/order-payment/order-payment').then(m => m.OrderPayment)
          },
          {
            path: ':id/complete',
            loadComponent: () => import('./layout/pages/order/components/order-complete/order-complete').then(m => m.OrderComplete)
          },
          {
            path: 'products',
            loadComponent: () => import('./layout/pages/product/components/product-selection/product-selection').then(m => m.ProductSelection),
            data: { context: 'order', return_route: '/layout/orders/create' }
          }
        ]
      },

      // customers
      {
        path: 'customers',
        canActivate: [roleGuard],
        data: { route_key: 'customers' },
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'create',
            loadComponent: () => import('./layout/pages/customer/components/customer-create/customer-create').then(m => m.CustomerCreate)
          },
          {
            path: 'preview',
            loadComponent: () => import('./layout/pages/customer/components/customer-preview/customer-preview').then(m => m.CustomerPreview)
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./layout/pages/customer/components/customer-preview/customer-preview').then(m => m.CustomerPreview)
          },
          {
            path: 'list',
            loadComponent: () => import('./layout/pages/customer/components/customer-list/customer-list').then(m => m.CustomerList)
          },
        ]
      },

      // sales
      {
        path: 'sales',
        canActivate: [roleGuard],
        data: { route_key: 'sales' },
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./layout/pages/sale/components/sale-list/sale-list').then(m => m.SaleList)
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./layout/pages/sale/components/sale-preview/sale-preview').then(m => m.SalePreview)
          },
          {
            path: ':id/payments',
            loadComponent: () => import('./layout/pages/sale/components/sale-payment/sale-payment').then(m => m.SalePayment)
          },
          {
            path: ':id/complete',
            loadComponent: () => import('./layout/pages/sale/components/sale-complete/sale-complete').then(m => m.SaleComplete)
          },
          {
            path: 'profit',
            loadComponent: () => import('./layout/pages/sale/components/sale-profit/sale-profit').then(m => m.SaleProfit)
          },
          {
            path: 'profit/:id/traceability',
            loadComponent: () => import('./layout/pages/sale/components/sale-profit-traceability/sale-profit-traceability').then(m => m.SaleProfitTraceability)
          },
          {
            path: 'receivables',
            loadComponent: () => import('./layout/pages/sale/components/sale-receivables/sale-receivables').then(m => m.SaleReceivables)
          },
        ]
      },

      // purchases
      {
        path: 'purchases',
        canActivate: [roleGuard],
        data: { route_key: 'purchases' },
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./layout/pages/purchase/components/purchase-list/purchase-list').then(m => m.PurchaseList)
          },
          {
            path: 'create',
            loadComponent: () => import('./layout/pages/purchase/components/purchase-create/purchase-create').then(m => m.PurchaseCreate)
          },
          {
            path: 'preview',
            loadComponent: () => import('./layout/pages/purchase/components/purchase-preview/purchase-preview').then(m => m.PurchasePreview)
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./layout/pages/purchase/components/purchase-preview/purchase-preview').then(m => m.PurchasePreview)
          },
          {
            path: ':id/payments',
            loadComponent: () => import('./layout/pages/purchase/components/purchase-payment/purchase-payment').then(m => m.PurchasePayment)
          },
          {
            path: ':id/complete',
            loadComponent: () => import('./layout/pages/purchase/components/purchase-complete/purchase-complete').then(m => m.PurchaseComplete)
          },
          {
            path: 'products',
            loadComponent: () => import('./layout/pages/product/components/product-selection/product-selection').then(m => m.ProductSelection),
            data: { context: 'purchase', return_route: '/layout/purchases/create' }
          },
          {
            path: 'payables',
            loadComponent: () => import('./layout/pages/purchase/components/purchase-payables/purchase-payables').then(m => m.PurchasePayables)
          },
        ]
      },

      // suppliers
      {
        path: 'suppliers',
        canActivate: [roleGuard],
        data: { route_key: 'suppliers' },
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./layout/pages/supplier/components/supplier-list/supplier-list').then(m => m.SupplierList)
          },
          {
            path: 'create',
            loadComponent: () => import('./layout/pages/supplier/components/supplier-create/supplier-create').then(m => m.SupplierCreate)
          },
          {
            path: 'preview',
            loadComponent: () => import('./layout/pages/supplier/components/supplier-preview/supplier-preview').then(m => m.SupplierPreview)
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./layout/pages/supplier/components/supplier-preview/supplier-preview').then(m => m.SupplierPreview)
          }
        ]
      },

      // inventories
      {
        path: 'inventories',
        canActivate: [roleGuard],
        data: { route_key: 'inventories' },
        children: [
          { path: '', redirectTo: 'stock', pathMatch: 'full' },
          {
            path: 'stock',
            loadComponent: () => import('./layout/pages/inventory/components/inventory-stock/inventory-stock').then(m => m.InventoryStock)
          },
          {
            path: 'valuation',
            loadComponent: () => import('./layout/pages/inventory/components/inventory-valuation/inventory-valuation').then(m => m.InventoryValuation)
          }
        ]
      },

      // expenses
      {
        path: 'expenses',
        canActivate: [roleGuard],
        data: { route_key: 'expenses' },
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./layout/pages/expense/components/expense-list/expense-list').then(m => m.ExpenseList)
          },
          {
            path: 'create',
            loadComponent: () => import('./layout/pages/expense/components/expense-create/expense-create').then(m => m.ExpenseCreate)
          },
          {
            path: 'preview',
            loadComponent: () => import('./layout/pages/expense/components/expense-preview/expense-preview').then(m => m.ExpensePreview)
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./layout/pages/expense/components/expense-preview/expense-preview').then(m => m.ExpensePreview)
          },
          {
            path: 'concepts',
            children: [
              {
                path: 'create',
                loadComponent: () => import('./layout/pages/expense/components/expense-concept-create/expense-concept-create').then(m => m.ExpenseConceptCreate)
              },
              {
                path: 'preview',
                loadComponent: () => import('./layout/pages/expense/components/expense-concept-preview/expense-concept-preview').then(m => m.ExpenseConceptPreview)
              }
            ]
          }
        ]
      },

      // incomes
      {
        path: 'incomes',
        canActivate: [roleGuard],
        data: { route_key: 'incomes' },
        children: [
          { path: '', redirectTo: 'list', pathMatch: 'full' },
          {
            path: 'list',
            loadComponent: () => import('./layout/pages/income/components/income-list/income-list').then(m => m.IncomeList)
          },
          {
            path: 'create',
            loadComponent: () => import('./layout/pages/income/components/income-create/income-create').then(m => m.IncomeCreate)
          },
          {
            path: 'preview',
            loadComponent: () => import('./layout/pages/income/components/income-preview/income-preview').then(m => m.IncomePreview)
          },
          {
            path: 'preview/:id',
            loadComponent: () => import('./layout/pages/income/components/income-preview/income-preview').then(m => m.IncomePreview)
          },
          {
            path: 'concepts',
            children: [
              {
                path: 'create',
                loadComponent: () => import('./layout/pages/income/components/income-concept-create/income-concept-create').then(m => m.IncomeConceptCreate)
              },
              {
                path: 'preview',
                loadComponent: () => import('./layout/pages/income/components/income-concept-preview/income-concept-preview').then(m => m.IncomeConceptPreview)
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
