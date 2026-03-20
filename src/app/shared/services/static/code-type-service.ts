import { Injectable } from '@angular/core';
import { static_option } from '../../models/common/static-option.model';

@Injectable({
  providedIn: 'root',
})
export class CodeTypeService {
  // datos estaticos de tipos de codigo
  private code_types: static_option[] = [
    { code: 'OEM', label: 'Código original del fabricante' },
    { code: 'ALT', label: 'Código alternativo' },
    { code: 'UNI', label: 'Código universal' },
    { code: 'RMP', label: 'Código de reemplazo' },
  ];

  // obtiene lista de tipos de codigo
  get_code_types(): static_option[] {
    return this.code_types;
  }
}
