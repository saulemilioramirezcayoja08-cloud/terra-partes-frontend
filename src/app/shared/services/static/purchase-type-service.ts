import { Injectable } from '@angular/core';
import { static_option } from '../../models/common/static-option.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseTypeService {
  // datos estaticos de tipos de compra
  private types: static_option[] = [
    {code: 'LOCAL', label: 'Local'},
    {code: 'IMPORT', label: 'Importación'},
  ];

  // obtiene lista de tipos de compra
  get_types(): static_option[] {
    return this.types;
  }
}