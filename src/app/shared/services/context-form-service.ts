import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { product_list_response } from '../../layout/pages/product/models/response/product-list-response.model';
import { order_create_request } from '../../layout/pages/order/models/request/order-create.request';
import { order_create_response } from '../../layout/pages/order/models/response/order-create-response.model';
import { order_context_form } from '../models/context/order-context-form.model';
import { expense_context_form } from '../models/context/expense-context-form.model';
import { expense_create_response } from '../../layout/pages/expense/models/response/expense-create-response.model';
import { product_context_form } from '../models/context/product-context-form.model';
import { product_create_response } from '../../layout/pages/product/models/response/product-create-response.model';
import { customer_context_form } from '../models/context/customer-context-form.model';
import { supplier_context_form } from '../models/context/supplier-context-form.model';
import { customer_create_response } from '../../layout/pages/customer/models/response/customer-create-response.model';
import { supplier_create_response } from '../../layout/pages/supplier/models/response/supplier-create-response.model';
import { purchase_context_form } from '../models/context/purchase-context-form.model';
import { purchase_create_response } from '../../layout/pages/purchase/models/response/purchase-create-response.model';
import { purchase_create_request } from '../../layout/pages/purchase/models/request/purchase-create.request';
import { quotation_create_response } from '../../layout/pages/quotation/models/response/quotation-create-response.model';
import { quotation_create_request } from '../../layout/pages/quotation/models/request/quotation-create.request';
import { quotation_context_form } from '../models/context/quotation-context-form.model';
import { income_context_form } from '../models/context/income-context-form.model';
import { income_create_response } from '../../layout/pages/income/models/response/income-create-response.model';
import { income_concept_context_form } from '../models/context/income-concept-context-form.model';
import { expense_concept_context_form } from '../models/context/expense-concept-context-form.model';
import {
  income_concept_create_response
} from '../../layout/pages/income/models/response/income-concept-create-response.model';
import {
  expense_concept_create_response
} from '../../layout/pages/expense/models/response/expense-concept-create-response.model';

@Injectable({
  providedIn: 'root',
})
export class ContextFormService {
  // dependencias
  private platform_id = inject(PLATFORM_ID);

  // configuracion
  private order_storage_key = 'order_context_form';
  private expense_storage_key = 'expense_context_form';
  private income_storage_key = 'income_context_form';
  private income_concept_storage_key = 'income_concept_context_form';
  private expense_concept_storage_key = 'expense_concept_context_form';
  private product_storage_key = 'product_context_form';
  private customer_storage_key = 'customer_context_form';
  private supplier_storage_key = 'supplier_context_form';
  private purchase_storage_key = 'purchase_context_form';
  private quotation_storage_key = 'quotation_context_form';

  // estado en memoria
  private order_contexts = new Map<string, order_context_form>();
  private expense_contexts = new Map<string, expense_context_form>();
  private income_contexts = new Map<string, income_context_form>();
  private income_concept_contexts = new Map<string, income_concept_context_form>();
  private expense_concept_contexts = new Map<string, expense_concept_context_form>();
  private product_contexts = new Map<string, product_context_form>();
  private customer_contexts = new Map<string, customer_context_form>();
  private supplier_contexts = new Map<string, supplier_context_form>();
  private purchase_contexts = new Map<string, purchase_context_form>();
  private quotation_contexts = new Map<string, quotation_context_form>();

  constructor() {
    this.load_from_storage();
  }

  // ========== ORDER ==========

  // obtiene datos por defecto para order
  private get_default_order_data(): order_context_form {
    return {
      form: {
        user_id: null,
        customer_id: null,
        warehouse_id: 1,
        currency: 'BOB',
        notes: ''
      },
      payment: null,
      reference: null,
      items: [],
      last_order: null
    };
  }

  // obtiene o crea datos del contexto order
  private get_or_create_order(context: string): order_context_form {
    if (!this.order_contexts.has(context)) {
      this.order_contexts.set(context, this.get_default_order_data());
    }
    return this.order_contexts.get(context)!;
  }

  // obtiene datos del formulario order
  get_form_data(context: string): order_context_form {
    return this.get_or_create_order(context);
  }

  // actualiza datos generales del formulario order
  update_form(context: string, data: Partial<order_context_form['form']>): void {
    const form_data = this.get_or_create_order(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // actualiza payment order
  update_payment(context: string, payment: order_context_form['payment']): void {
    const form_data = this.get_or_create_order(context);
    form_data.payment = payment;
    this.save_to_storage();
  }

  // obtiene items order
  get_items(context: string): order_context_form['items'] {
    return [...this.get_or_create_order(context).items];
  }

  // obtiene map de product_id para verificacion rapida
  get_items_map(context: string): Map<number, order_context_form['items'][0]> {
    const items = this.get_or_create_order(context).items;
    const map = new Map<number, order_context_form['items'][0]>();
    items.forEach(item => map.set(item.product.id, item));
    return map;
  }

  // agrega producto desde product_list_response
  add_product(context: string, product: product_list_response): void {
    const form_data = this.get_or_create_order(context);

    // verifica si ya existe
    const exists = form_data.items.some(item => item.product.id === product.product.id);
    if (exists) return;

    // crea nuevo item
    const new_item: order_context_form['items'][0] = {
      product: {
        id: product.product.id,
        sku: product.product.sku,
        name: product.product.name,
        uom: product.product.uom,
        origin: product.product.origin
      },
      category: product.category ? { name: product.category.name } : null,
      stock: {
        available: product.stock.available
      },
      detail: {
        quantity: 1,
        price: product.product.price,
        notes: null
      }
    };

    form_data.items.push(new_item);
    this.save_to_storage();
  }

  // agrega multiples productos
  add_products(context: string, products: product_list_response[]): void {
    products.forEach(product => this.add_product(context, product));
  }

  // actualiza item existente order
  update_item(context: string, product_id: number, data: Partial<order_context_form['items'][0]['detail']>): void {
    const form_data = this.get_or_create_order(context);
    const index = form_data.items.findIndex(item => item.product.id === product_id);
    if (index === -1) return;

    form_data.items[index].detail = { ...form_data.items[index].detail, ...data };
    this.save_to_storage();
  }

  // elimina item order
  remove_item(context: string, product_id: number): void {
    const form_data = this.get_or_create_order(context);
    form_data.items = form_data.items.filter(item => item.product.id !== product_id);
    this.save_to_storage();
  }

  // guarda ultima orden creada
  set_last_order(context: string, order: order_create_response | null): void {
    const form_data = this.get_or_create_order(context);
    form_data.last_order = order;
    this.save_to_storage();
  }
  
  // obtiene ultima orden creada
  get_last_order(context: string): order_create_response | null {
    return this.get_or_create_order(context).last_order;
  }

  // construye request para order
  build_order_request(context: string): order_create_request {
    const form_data = this.get_or_create_order(context);
    return {
      user_id: form_data.form.user_id!,
      customer_id: form_data.form.customer_id!,
      warehouse_id: form_data.form.warehouse_id,
      currency: form_data.form.currency,
      payment_method_id: form_data.payment!.method_id!,
      quotation_id: form_data.reference?.quotation_id ?? null,
      notes: form_data.form.notes,
      payment: form_data.payment?.amount ? { amount: form_data.payment.amount } : null,
      items: form_data.items.map(item => ({
        product_id: item.product.id,
        quantity: item.detail.quantity,
        price: item.detail.price,
        notes: item.detail.notes
      }))
    };
  }

  // limpia contexto order
  clear(context: string): void {
    this.order_contexts.set(context, this.get_default_order_data());
    this.save_to_storage();
  }

  // limpia solo items del contexto order
  clear_items(context: string): void {
    const form_data = this.get_or_create_order(context);
    form_data.items = [];
    this.save_to_storage();
  }

  // ========== PURCHASE ==========

  // obtiene datos por defecto para purchase
  private get_default_purchase_data(): purchase_context_form {
    return {
      form: {
        user_id: null,
        supplier_id: null,
        warehouse_id: 1,
        currency: 'BOB',
        type: 'LOCAL',
        notes: ''
      },
      payment: null,
      items: [],
      last_purchase: null
    };
  }

  // obtiene o crea datos del contexto purchase
  private get_or_create_purchase(context: string): purchase_context_form {
    if (!this.purchase_contexts.has(context)) {
      this.purchase_contexts.set(context, this.get_default_purchase_data());
    }
    return this.purchase_contexts.get(context)!;
  }

  // obtiene datos del formulario purchase
  get_purchase_data(context: string): purchase_context_form {
    return this.get_or_create_purchase(context);
  }

  // actualiza datos generales del formulario purchase
  update_purchase_form(context: string, data: Partial<purchase_context_form['form']>): void {
    const form_data = this.get_or_create_purchase(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // actualiza payment purchase
  update_purchase_payment(context: string, payment: purchase_context_form['payment']): void {
    const form_data = this.get_or_create_purchase(context);
    form_data.payment = payment;
    this.save_to_storage();
  }

  // obtiene items purchase
  get_purchase_items(context: string): purchase_context_form['items'] {
    return [...this.get_or_create_purchase(context).items];
  }

  // obtiene map de product_id para verificacion rapida purchase
  get_purchase_items_map(context: string): Map<number, purchase_context_form['items'][0]> {
    const items = this.get_or_create_purchase(context).items;
    const map = new Map<number, purchase_context_form['items'][0]>();
    items.forEach(item => map.set(item.product.id, item));
    return map;
  }

  // agrega producto purchase desde product_list_response
  add_purchase_product(context: string, product: product_list_response): void {
    const form_data = this.get_or_create_purchase(context);

    // verifica si ya existe
    const exists = form_data.items.some(item => item.product.id === product.product.id);
    if (exists) return;

    // crea nuevo item
    const new_item: purchase_context_form['items'][0] = {
      product: {
        id: product.product.id,
        sku: product.product.sku,
        name: product.product.name,
        uom: product.product.uom,
        origin: product.product.origin
      },
      category: product.category ? { name: product.category.name } : null,
      stock: {
        available: product.stock.available
      },
      detail: {
        quantity: 1,
        price: product.product.price,
        notes: null
      }
    };

    form_data.items.push(new_item);
    this.save_to_storage();
  }

  // agrega multiples productos purchase
  add_purchase_products(context: string, products: product_list_response[]): void {
    products.forEach(product => this.add_purchase_product(context, product));
  }

  // actualiza item existente purchase
  update_purchase_item(context: string, product_id: number, data: Partial<purchase_context_form['items'][0]['detail']>): void {
    const form_data = this.get_or_create_purchase(context);
    const index = form_data.items.findIndex(item => item.product.id === product_id);
    if (index === -1) return;

    form_data.items[index].detail = { ...form_data.items[index].detail, ...data };
    this.save_to_storage();
  }

  // elimina item purchase
  remove_purchase_item(context: string, product_id: number): void {
    const form_data = this.get_or_create_purchase(context);
    form_data.items = form_data.items.filter(item => item.product.id !== product_id);
    this.save_to_storage();
  }

  // guarda ultima compra creada
  set_last_purchase(context: string, purchase: purchase_create_response): void {
    const form_data = this.get_or_create_purchase(context);
    form_data.last_purchase = purchase;
    this.save_to_storage();
  }

  // obtiene ultima compra creada
  get_last_purchase(context: string): purchase_create_response | null {
    return this.get_or_create_purchase(context).last_purchase;
  }

  // construye request para purchase
  build_purchase_request(context: string): purchase_create_request {
    const form_data = this.get_or_create_purchase(context);
    return {
      user_id: form_data.form.user_id!,
      supplier_id: form_data.form.supplier_id!,
      warehouse_id: form_data.form.warehouse_id,
      currency: form_data.form.currency,
      payment_method_id: form_data.payment!.method_id!,
      type: form_data.form.type,
      notes: form_data.form.notes || null,
      items: form_data.items.map(item => ({
        product_id: item.product.id,
        quantity: item.detail.quantity,
        price: item.detail.price,
        notes: item.detail.notes
      })),
      payment: form_data.payment?.amount ? { amount: form_data.payment.amount } : null
    };
  }

  // limpia contexto purchase
  clear_purchase(context: string): void {
    this.purchase_contexts.set(context, this.get_default_purchase_data());
    this.save_to_storage();
  }

  // limpia solo items del contexto purchase
  clear_purchase_items(context: string): void {
    const form_data = this.get_or_create_purchase(context);
    form_data.items = [];
    this.save_to_storage();
  }

  // ========== QUOTATION ==========

  // obtiene datos por defecto para quotation
  private get_default_quotation_data(): quotation_context_form {
    return {
      form: {
        user_id: null,
        customer_id: null,
        warehouse_id: 1,
        currency: 'BOB',
        notes: ''
      },
      items: [],
      last_quotation: null
    };
  }

  // obtiene o crea datos del contexto quotation
  private get_or_create_quotation(context: string): quotation_context_form {
    if (!this.quotation_contexts.has(context)) {
      this.quotation_contexts.set(context, this.get_default_quotation_data());
    }
    return this.quotation_contexts.get(context)!;
  }

  // obtiene datos del formulario quotation
  get_quotation_form_data(context: string): quotation_context_form {
    return this.get_or_create_quotation(context);
  }

  // actualiza datos generales del formulario quotation
  update_quotation_form(context: string, data: Partial<quotation_context_form['form']>): void {
    const form_data = this.get_or_create_quotation(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // obtiene items quotation
  get_quotation_items(context: string): quotation_context_form['items'] {
    return [...this.get_or_create_quotation(context).items];
  }

  // obtiene map de product_id para verificacion rapida quotation
  get_quotation_items_map(context: string): Map<number, quotation_context_form['items'][0]> {
    const items = this.get_or_create_quotation(context).items;
    const map = new Map<number, quotation_context_form['items'][0]>();
    items.forEach(item => map.set(item.product.id, item));
    return map;
  }

  // agrega producto quotation
  add_quotation_product(context: string, product: product_list_response): void {
    const form_data = this.get_or_create_quotation(context);

    // verifica si ya existe
    const exists = form_data.items.some(item => item.product.id === product.product.id);
    if (exists) return;

    // crea nuevo item
    const new_item: quotation_context_form['items'][0] = {
      product: {
        id: product.product.id,
        sku: product.product.sku,
        name: product.product.name,
        uom: product.product.uom,
        origin: product.product.origin
      },
      category: product.category ? { name: product.category.name } : null,
      stock: {
        available: product.stock.available
      },
      detail: {
        quantity: 1,
        price: product.product.price,
        notes: null
      }
    };

    form_data.items.push(new_item);
    this.save_to_storage();
  }

  // agrega multiples productos quotation
  add_quotation_products(context: string, products: product_list_response[]): void {
    products.forEach(product => this.add_quotation_product(context, product));
  }

  // actualiza item existente quotation
  update_quotation_item(context: string, product_id: number, data: Partial<quotation_context_form['items'][0]['detail']>): void {
    const form_data = this.get_or_create_quotation(context);
    const index = form_data.items.findIndex(item => item.product.id === product_id);
    if (index === -1) return;

    form_data.items[index].detail = { ...form_data.items[index].detail, ...data };
    this.save_to_storage();
  }

  // elimina item quotation
  remove_quotation_item(context: string, product_id: number): void {
    const form_data = this.get_or_create_quotation(context);
    form_data.items = form_data.items.filter(item => item.product.id !== product_id);
    this.save_to_storage();
  }

  // guarda ultima cotizacion creada
  set_last_quotation(context: string, quotation: quotation_create_response | null): void {
    const form_data = this.get_or_create_quotation(context);
    form_data.last_quotation = quotation;
    this.save_to_storage();
  }

  // obtiene ultima cotizacion creada
  get_last_quotation(context: string): quotation_create_response | null {
    return this.get_or_create_quotation(context).last_quotation;
  }

  // construye request para quotation
  build_quotation_request(context: string): quotation_create_request {
    const form_data = this.get_or_create_quotation(context);
    return {
      user_id: form_data.form.user_id!,
      customer_id: form_data.form.customer_id!,
      warehouse_id: form_data.form.warehouse_id,
      currency: form_data.form.currency,
      notes: form_data.form.notes || null,
      items: form_data.items.map(item => ({
        product_id: item.product.id,
        quantity: item.detail.quantity,
        price: item.detail.price,
        notes: item.detail.notes
      }))
    };
  }

  // limpia contexto quotation
  clear_quotation(context: string): void {
    this.quotation_contexts.set(context, this.get_default_quotation_data());
    this.save_to_storage();
  }

  // limpia solo items del contexto quotation
  clear_quotation_items(context: string): void {
    const form_data = this.get_or_create_quotation(context);
    form_data.items = [];
    this.save_to_storage();
  }

  // ========== EXPENSE ==========

  // obtiene datos por defecto para expense
  private get_default_expense_data(): expense_context_form {
    return {
      form: {
        user_id: null,
        payment_method_id: null,
        currency: 'BOB',
        date: '',
        notes: ''
      },
      items: [],
      last_expense: null
    };
  }

  // obtiene o crea datos del contexto expense
  private get_or_create_expense(context: string): expense_context_form {
    if (!this.expense_contexts.has(context)) {
      this.expense_contexts.set(context, this.get_default_expense_data());
    }
    return this.expense_contexts.get(context)!;
  }

  // obtiene datos del formulario expense
  get_expense_data(context: string): expense_context_form {
    return this.get_or_create_expense(context);
  }

  // actualiza datos generales del formulario expense
  update_expense_form(context: string, data: Partial<expense_context_form['form']>): void {
    const form_data = this.get_or_create_expense(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // obtiene items expense
  get_expense_items(context: string): expense_context_form['items'] {
    return [...this.get_or_create_expense(context).items];
  }

  // agrega item expense
  add_expense_item(context: string, item: expense_context_form['items'][0]): void {
    const form_data = this.get_or_create_expense(context);
    form_data.items.push(item);
    this.save_to_storage();
  }

  // actualiza item expense
  update_expense_item(context: string, index: number, data: Partial<expense_context_form['items'][0]>): void {
    const form_data = this.get_or_create_expense(context);
    if (index < 0 || index >= form_data.items.length) return;

    form_data.items[index] = { ...form_data.items[index], ...data };
    this.save_to_storage();
  }

  // elimina item expense
  remove_expense_item(context: string, index: number): void {
    const form_data = this.get_or_create_expense(context);
    form_data.items = form_data.items.filter((_, i) => i !== index);
    this.save_to_storage();
  }

  // guarda ultimo egreso creado
  set_last_expense(context: string, expense: expense_create_response): void {
    const form_data = this.get_or_create_expense(context);
    form_data.last_expense = expense;
    this.save_to_storage();
  }

  // obtiene ultimo egreso creado
  get_last_expense(context: string): expense_create_response | null {
    return this.get_or_create_expense(context).last_expense;
  }

  // limpia contexto expense
  clear_expense(context: string): void {
    this.expense_contexts.set(context, this.get_default_expense_data());
    this.save_to_storage();
  }

  // limpia solo items del contexto expense
  clear_expense_items(context: string): void {
    const form_data = this.get_or_create_expense(context);
    form_data.items = [];
    this.save_to_storage();
  }

  // ========== INCOME ==========

  // obtiene datos por defecto para income
  private get_default_income_data(): income_context_form {
    return {
      form: {
        user_id: null,
        payment_method_id: null,
        currency: 'BOB',
        date: '',
        notes: ''
      },
      items: [],
      last_income: null
    };
  }

  // obtiene o crea datos del contexto income
  private get_or_create_income(context: string): income_context_form {
    if (!this.income_contexts.has(context)) {
      this.income_contexts.set(context, this.get_default_income_data());
    }
    return this.income_contexts.get(context)!;
  }

  // obtiene datos del formulario income
  get_income_data(context: string): income_context_form {
    return this.get_or_create_income(context);
  }

  // actualiza datos generales del formulario income
  update_income_form(context: string, data: Partial<income_context_form['form']>): void {
    const form_data = this.get_or_create_income(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // obtiene items income
  get_income_items(context: string): income_context_form['items'] {
    return [...this.get_or_create_income(context).items];
  }

  // agrega item income
  add_income_item(context: string, item: income_context_form['items'][0]): void {
    const form_data = this.get_or_create_income(context);
    form_data.items.push(item);
    this.save_to_storage();
  }

  // actualiza item income
  update_income_item(context: string, index: number, data: Partial<income_context_form['items'][0]>): void {
    const form_data = this.get_or_create_income(context);
    if (index < 0 || index >= form_data.items.length) return;

    form_data.items[index] = { ...form_data.items[index], ...data };
    this.save_to_storage();
  }

  // elimina item income
  remove_income_item(context: string, index: number): void {
    const form_data = this.get_or_create_income(context);
    form_data.items = form_data.items.filter((_, i) => i !== index);
    this.save_to_storage();
  }

  // guarda ultimo ingreso creado
  set_last_income(context: string, income: income_create_response): void {
    const form_data = this.get_or_create_income(context);
    form_data.last_income = income;
    this.save_to_storage();
  }

  // obtiene ultimo ingreso creado
  get_last_income(context: string): income_create_response | null {
    return this.get_or_create_income(context).last_income;
  }

  // limpia contexto income
  clear_income(context: string): void {
    this.income_contexts.set(context, this.get_default_income_data());
    this.save_to_storage();
  }

  // limpia solo items del contexto income
  clear_income_items(context: string): void {
    const form_data = this.get_or_create_income(context);
    form_data.items = [];
    this.save_to_storage();
  }

  // ========== INCOME CONCEPT ==========

  // obtiene datos por defecto para income concept
  private get_default_income_concept_data(): income_concept_context_form {
    return {
      form: {
        user_id: null,
        name: '',
        description: ''
      },
      last_income_concept: null
    };
  }

  // obtiene o crea datos del contexto income concept
  private get_or_create_income_concept(context: string): income_concept_context_form {
    if (!this.income_concept_contexts.has(context)) {
      this.income_concept_contexts.set(context, this.get_default_income_concept_data());
    }
    return this.income_concept_contexts.get(context)!;
  }

  // obtiene datos del formulario income concept
  get_income_concept_data(context: string): income_concept_context_form {
    return this.get_or_create_income_concept(context);
  }

  // actualiza datos generales del formulario income concept
  update_income_concept_form(context: string, data: Partial<income_concept_context_form['form']>): void {
    const form_data = this.get_or_create_income_concept(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // guarda ultimo concepto de ingreso creado
  set_last_income_concept(context: string, concept: income_concept_create_response): void {
    const form_data = this.get_or_create_income_concept(context);
    form_data.last_income_concept = concept;
    this.save_to_storage();
  }

  // obtiene ultimo concepto de ingreso creado
  get_last_income_concept(context: string): income_concept_create_response | null {
    return this.get_or_create_income_concept(context).last_income_concept;
  }

  // limpia contexto income concept
  clear_income_concept(context: string): void {
    this.income_concept_contexts.set(context, this.get_default_income_concept_data());
    this.save_to_storage();
  }

  // ========== EXPENSE CONCEPT ==========

  // obtiene datos por defecto para expense concept
  private get_default_expense_concept_data(): expense_concept_context_form {
    return {
      form: {
        user_id: null,
        name: '',
        description: ''
      },
      last_expense_concept: null
    };
  }

  // obtiene o crea datos del contexto expense concept
  private get_or_create_expense_concept(context: string): expense_concept_context_form {
    if (!this.expense_concept_contexts.has(context)) {
      this.expense_concept_contexts.set(context, this.get_default_expense_concept_data());
    }
    return this.expense_concept_contexts.get(context)!;
  }

  // obtiene datos del formulario expense concept
  get_expense_concept_data(context: string): expense_concept_context_form {
    return this.get_or_create_expense_concept(context);
  }

  // actualiza datos generales del formulario expense concept
  update_expense_concept_form(context: string, data: Partial<expense_concept_context_form['form']>): void {
    const form_data = this.get_or_create_expense_concept(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // guarda ultimo concepto de egreso creado
  set_last_expense_concept(context: string, concept: expense_concept_create_response): void {
    const form_data = this.get_or_create_expense_concept(context);
    form_data.last_expense_concept = concept;
    this.save_to_storage();
  }

  // obtiene ultimo concepto de egreso creado
  get_last_expense_concept(context: string): expense_concept_create_response | null {
    return this.get_or_create_expense_concept(context).last_expense_concept;
  }

  // limpia contexto expense concept
  clear_expense_concept(context: string): void {
    this.expense_concept_contexts.set(context, this.get_default_expense_concept_data());
    this.save_to_storage();
  }

  // ========== PRODUCT ==========

  // obtiene datos por defecto para product
  private get_default_product_data(): product_context_form {
    return {
      form: {
        user_id: null,
        sku: '',
        name: '',
        description: '',
        category_id: null,
        uom: 'PZA',
        price: 0,
        origin: 'OR'
      },
      codes: [],
      last_product: null
    };
  }

  // obtiene o crea datos del contexto product
  private get_or_create_product(context: string): product_context_form {
    if (!this.product_contexts.has(context)) {
      this.product_contexts.set(context, this.get_default_product_data());
    }
    return this.product_contexts.get(context)!;
  }

  // obtiene datos del formulario product
  get_product_data(context: string): product_context_form {
    return this.get_or_create_product(context);
  }

  // actualiza datos generales del formulario product
  update_product_form(context: string, data: Partial<product_context_form['form']>): void {
    const form_data = this.get_or_create_product(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // obtiene codes product
  get_product_codes(context: string): product_context_form['codes'] {
    return [...this.get_or_create_product(context).codes];
  }

  // agrega code product
  add_product_code(context: string, code: product_context_form['codes'][0]): void {
    const form_data = this.get_or_create_product(context);
    form_data.codes.push(code);
    this.save_to_storage();
  }

  // actualiza code product
  update_product_code(context: string, index: number, data: Partial<product_context_form['codes'][0]>): void {
    const form_data = this.get_or_create_product(context);
    if (index < 0 || index >= form_data.codes.length) return;

    form_data.codes[index] = { ...form_data.codes[index], ...data };
    this.save_to_storage();
  }

  // elimina code product
  remove_product_code(context: string, index: number): void {
    const form_data = this.get_or_create_product(context);
    form_data.codes = form_data.codes.filter((_, i) => i !== index);
    this.save_to_storage();
  }

  // guarda ultimo producto creado
  set_last_product(context: string, product: product_create_response): void {
    const form_data = this.get_or_create_product(context);
    form_data.last_product = product;
    this.save_to_storage();
  }

  // obtiene ultimo producto creado
  get_last_product(context: string): product_create_response | null {
    return this.get_or_create_product(context).last_product;
  }

  // limpia contexto product
  clear_product(context: string): void {
    this.product_contexts.set(context, this.get_default_product_data());
    this.save_to_storage();
  }

  // limpia solo codes del contexto product
  clear_product_codes(context: string): void {
    const form_data = this.get_or_create_product(context);
    form_data.codes = [];
    this.save_to_storage();
  }

  // ========== CUSTOMER ==========

  // obtiene datos por defecto para customer
  private get_default_customer_data(): customer_context_form {
    return {
      form: {
        user_id: null,
        tax_id: '',
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      last_customer: null
    };
  }

  // obtiene o crea datos del contexto customer
  private get_or_create_customer(context: string): customer_context_form {
    if (!this.customer_contexts.has(context)) {
      this.customer_contexts.set(context, this.get_default_customer_data());
    }
    return this.customer_contexts.get(context)!;
  }

  // obtiene datos del formulario customer
  get_customer_data(context: string): customer_context_form {
    return this.get_or_create_customer(context);
  }

  // actualiza datos generales del formulario customer
  update_customer_form(context: string, data: Partial<customer_context_form['form']>): void {
    const form_data = this.get_or_create_customer(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // guarda ultimo cliente creado
  set_last_customer(context: string, customer: customer_create_response): void {
    const data = this.get_or_create_customer(context);
    data.last_customer = customer;
    this.save_to_storage();
  }

  // obtiene ultimo cliente creado
  get_last_customer(context: string): customer_create_response | null {
    return this.get_or_create_customer(context).last_customer;
  }

  // limpia contexto customer
  clear_customer(context: string): void {
    this.customer_contexts.set(context, this.get_default_customer_data());
    this.save_to_storage();
  }

  // ========== SUPPLIER ==========

  // obtiene datos por defecto para supplier
  private get_default_supplier_data(): supplier_context_form {
    return {
      form: {
        user_id: null,
        tax_id: '',
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      last_supplier: null
    };
  }

  // obtiene o crea datos del contexto supplier
  private get_or_create_supplier(context: string): supplier_context_form {
    if (!this.supplier_contexts.has(context)) {
      this.supplier_contexts.set(context, this.get_default_supplier_data());
    }
    return this.supplier_contexts.get(context)!;
  }

  // obtiene datos del formulario supplier
  get_supplier_data(context: string): supplier_context_form {
    return this.get_or_create_supplier(context);
  }

  // actualiza datos generales del formulario supplier
  update_supplier_form(context: string, data: Partial<supplier_context_form['form']>): void {
    const form_data = this.get_or_create_supplier(context);
    form_data.form = { ...form_data.form, ...data };
    this.save_to_storage();
  }

  // guarda ultimo proveedor creado
  set_last_supplier(context: string, supplier: supplier_create_response): void {
    const data = this.get_or_create_supplier(context);
    data.last_supplier = supplier;
    this.save_to_storage();
  }

  // obtiene ultimo proveedor creado
  get_last_supplier(context: string): supplier_create_response | null {
    return this.get_or_create_supplier(context).last_supplier;
  }

  // limpia contexto supplier
  clear_supplier(context: string): void {
    this.supplier_contexts.set(context, this.get_default_supplier_data());
    this.save_to_storage();
  }

  // ========== STORAGE ==========

  // carga desde storage
  private load_from_storage(): void {
    if (!isPlatformBrowser(this.platform_id)) return;

    try {
      // carga order contexts
      const order_stored = sessionStorage.getItem(this.order_storage_key);
      if (order_stored) {
        const parsed = JSON.parse(order_stored) as Record<string, order_context_form>;
        for (const [context, data] of Object.entries(parsed)) {
          this.order_contexts.set(context, data);
        }
      }

      // carga purchase contexts
      const purchase_stored = sessionStorage.getItem(this.purchase_storage_key);
      if (purchase_stored) {
        const parsed = JSON.parse(purchase_stored) as Record<string, purchase_context_form>;
        for (const [context, data] of Object.entries(parsed)) {
          this.purchase_contexts.set(context, data);
        }
      }

      // carga quotation contexts
      const quotation_stored = sessionStorage.getItem(this.quotation_storage_key);
      if (quotation_stored) {
        const quotation_parsed = JSON.parse(quotation_stored) as Record<string, quotation_context_form>;
        Object.entries(quotation_parsed).forEach(([context, data]) => {
          this.quotation_contexts.set(context, data);
        });
      }

      // carga expense contexts
      const expense_stored = sessionStorage.getItem(this.expense_storage_key);
      if (expense_stored) {
        const parsed = JSON.parse(expense_stored) as Record<string, expense_context_form>;
        for (const [context, data] of Object.entries(parsed)) {
          this.expense_contexts.set(context, data);
        }
      }

      // carga income contexts
      const income_stored = sessionStorage.getItem(this.income_storage_key);
      if (income_stored) {
        const parsed = JSON.parse(income_stored) as Record<string, income_context_form>;
        for (const [context, data] of Object.entries(parsed)) {
          this.income_contexts.set(context, data);
        }
      }

      // carga income concept contexts
      const income_concept_stored = sessionStorage.getItem(this.income_concept_storage_key);
      if (income_concept_stored) {
        const parsed = JSON.parse(income_concept_stored) as Record<string, income_concept_context_form>;
        for (const [context, data] of Object.entries(parsed)) {
          this.income_concept_contexts.set(context, data);
        }
      }

      // carga expense concept contexts
      const expense_concept_stored = sessionStorage.getItem(this.expense_concept_storage_key);
      if (expense_concept_stored) {
        const parsed = JSON.parse(expense_concept_stored) as Record<string, expense_concept_context_form>;
        for (const [context, data] of Object.entries(parsed)) {
          this.expense_concept_contexts.set(context, data);
        }
      }

      // carga product contexts
      const product_stored = sessionStorage.getItem(this.product_storage_key);
      if (product_stored) {
        const parsed = JSON.parse(product_stored) as Record<string, product_context_form>;
        for (const [context, data] of Object.entries(parsed)) {
          this.product_contexts.set(context, data);
        }
      }

      // carga customer contexts
      const customer_stored = sessionStorage.getItem(this.customer_storage_key);
      if (customer_stored) {
        const parsed = JSON.parse(customer_stored) as Record<string, customer_context_form>;
        for (const [context, data] of Object.entries(parsed)) {
          this.customer_contexts.set(context, data);
        }
      }

      // carga supplier contexts
      const supplier_stored = sessionStorage.getItem(this.supplier_storage_key);
      if (supplier_stored) {
        const parsed = JSON.parse(supplier_stored) as Record<string, supplier_context_form>;
        for (const [context, data] of Object.entries(parsed)) {
          this.supplier_contexts.set(context, data);
        }
      }
    } catch (error) {
      console.error('Error loading context form from storage:', error);
    }
  }

  // guarda en storage
  private save_to_storage(): void {
    if (!isPlatformBrowser(this.platform_id)) return;

    try {
      // guarda order contexts
      const order_to_store: Record<string, order_context_form> = {};
      this.order_contexts.forEach((data, context) => {
        order_to_store[context] = data;
      });
      sessionStorage.setItem(this.order_storage_key, JSON.stringify(order_to_store));

      // guarda purchase contexts
      const purchase_to_store: Record<string, purchase_context_form> = {};
      this.purchase_contexts.forEach((data, context) => {
        purchase_to_store[context] = data;
      });
      sessionStorage.setItem(this.purchase_storage_key, JSON.stringify(purchase_to_store));

      // guarda quotation contexts
      const quotation_to_store: Record<string, quotation_context_form> = {};
      this.quotation_contexts.forEach((data, context) => {
        quotation_to_store[context] = data;
      });
      sessionStorage.setItem(this.quotation_storage_key, JSON.stringify(quotation_to_store));

      // guarda expense contexts
      const expense_to_store: Record<string, expense_context_form> = {};
      this.expense_contexts.forEach((data, context) => {
        expense_to_store[context] = data;
      });
      sessionStorage.setItem(this.expense_storage_key, JSON.stringify(expense_to_store));

      // guarda income contexts
      const income_to_store: Record<string, income_context_form> = {};
      this.income_contexts.forEach((data, context) => {
        income_to_store[context] = data;
      });
      sessionStorage.setItem(this.income_storage_key, JSON.stringify(income_to_store));

      // guarda income concept contexts
      const income_concept_to_store: Record<string, income_concept_context_form> = {};
      this.income_concept_contexts.forEach((data, context) => {
        income_concept_to_store[context] = data;
      });
      sessionStorage.setItem(this.income_concept_storage_key, JSON.stringify(income_concept_to_store));

      // guarda expense concept contexts
      const expense_concept_to_store: Record<string, expense_concept_context_form> = {};
      this.expense_concept_contexts.forEach((data, context) => {
        expense_concept_to_store[context] = data;
      });
      sessionStorage.setItem(this.expense_concept_storage_key, JSON.stringify(expense_concept_to_store));

      // guarda product contexts
      const product_to_store: Record<string, product_context_form> = {};
      this.product_contexts.forEach((data, context) => {
        product_to_store[context] = data;
      });
      sessionStorage.setItem(this.product_storage_key, JSON.stringify(product_to_store));

      // guarda customer contexts
      const customer_to_store: Record<string, customer_context_form> = {};
      this.customer_contexts.forEach((data, context) => {
        customer_to_store[context] = data;
      });
      sessionStorage.setItem(this.customer_storage_key, JSON.stringify(customer_to_store));

      // guarda supplier contexts
      const supplier_to_store: Record<string, supplier_context_form> = {};
      this.supplier_contexts.forEach((data, context) => {
        supplier_to_store[context] = data;
      });
      sessionStorage.setItem(this.supplier_storage_key, JSON.stringify(supplier_to_store));
    } catch (error) {
      console.error('Error saving context form to storage:', error);
    }
  }
}
