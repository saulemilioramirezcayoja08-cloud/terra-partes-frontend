import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {map, Observable} from 'rxjs';
import {api_response, page_response} from '../../../../shared/models/common/response.model';
import {inventory_stock_response} from '../models/response/inventory-stock-response.model';
import {inventory_valuation_response} from '../models/response/inventory-valuation-response.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);
  private api_url = `${environment.api_url}/inventories`;

  // obtiene stock con filtros y paginacion
  get_stock(
    page: number,
    size: number,
    warehouse_id?: number | null,
    category_id?: number | null,
    sku?: string | null,
    name?: string | null
  ): Observable<page_response<inventory_stock_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString());

    if (warehouse_id) {
      params = params.set('warehouseId', warehouse_id.toString());
    }

    if (category_id) {
      params = params.set('categoryId', category_id.toString());
    }

    if (sku && sku.trim()) {
      params = params.set('sku', sku.trim());
    }

    if (name && name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<api_response<page_response<inventory_stock_response>>>(`${this.api_url}/stock`, {params}).pipe(
      map(response => response.data)
    );
  }

  // obtiene valorizacion con filtros y paginacion
  get_valuation(
    page: number,
    size: number,
    warehouse_id?: number | null,
    category_id?: number | null,
    sku?: string | null,
    name?: string | null
  ): Observable<page_response<inventory_valuation_response>> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString());

    if (warehouse_id) {
      params = params.set('warehouseId', warehouse_id.toString());
    }

    if (category_id) {
      params = params.set('categoryId', category_id.toString());
    }

    if (sku && sku.trim()) {
      params = params.set('sku', sku.trim());
    }

    if (name && name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<api_response<page_response<inventory_valuation_response>>>(`${this.api_url}/valuation`, {params}).pipe(
      map(response => response.data)
    );
  }
}
