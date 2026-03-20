import { Injectable } from '@angular/core';
import {static_option} from '../../models/common/static-option.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  // datos estaticos de estados
  private statuses: static_option[] = [
    {code: 'PENDING', label: 'Pendiente'},
    {code: 'COMPLETED', label: 'Completado'},
    {code: 'VOIDED', label: 'Anulado'},
    {code: 'RESERVED', label: 'Reservado'},
    {code: 'FULFILLED', label: 'Cumplido'},
  ];

  // obtiene lista de estados
  get_statuses(): static_option[] {
    return this.statuses;
  }
}
