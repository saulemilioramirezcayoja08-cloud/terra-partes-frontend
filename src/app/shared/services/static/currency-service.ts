import {Injectable} from '@angular/core';
import {static_option} from '../../models/common/static-option.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  // datos estaticos de monedas
  private currencies: static_option[] = [
    { code: 'BOB', label: 'Boliviano' },
    { code: 'USD', label: 'Dólar Americano' }
  ];

  // obtiene lista de monedas
  get_currencies(): static_option[] {
    return this.currencies;
  }
}
