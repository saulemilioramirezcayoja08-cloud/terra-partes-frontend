import { Injectable } from '@angular/core';
import {static_option} from '../../models/common/static-option.model';

@Injectable({
  providedIn: 'root',
})
export class UomService {
  // datos estaticos de unidades de medida
  private uoms: static_option[] = [
    { code: 'PZA', label: 'Pieza' },
    { code: 'JGO', label: 'Juego' }
  ];

  // obtiene lista de unidades de medida
  get_uoms(): static_option[] {
    return this.uoms;
  }
}
