import { Injectable } from '@angular/core';
import { static_option } from '../../models/common/static-option.model';

@Injectable({
  providedIn: 'root',
})
export class OriginService {
  // datos estaticos de origenes
  private origins: static_option[] = [
    { code: 'OR', label: 'Original' },
    { code: 'JPN', label: 'Japonés' },
    { code: 'KOR', label: 'Coreano' },
    { code: 'CHN', label: 'Chino' },
    { code: 'TWN', label: 'Taiwanés' },
    { code: 'ALT', label: 'Alternativo' },
  ];
  // obtiene lista de origenes
  get_origins(): static_option[] {
    return this.origins;
  }
}
