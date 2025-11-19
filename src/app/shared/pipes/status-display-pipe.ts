import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusDisplay'
})
export class StatusDisplayPipe implements PipeTransform {

    private readonly statusMap: { [key: string]: string } = {
    // Estados de documentos principales
    'DRAFT': 'PENDIENTE',
    'BORRADOR': 'PENDIENTE',
    'CONFIRMED': 'CONFIRMADA',
    'CONFIRMADA': 'CONFIRMADA',
    'CANCELLED': 'ANULADA',
    'CANCELADA': 'ANULADA',
    
    // Estados de reservas
    'ACTIVE': 'PENDIENTE',
    'ACTIVA': 'PENDIENTE',
    'CONSUMED': 'CONCLUIDA',
    'CONSUMIDA': 'CONCLUIDA'
  };
  
  transform(status: string): string {
    return this.statusMap[status?.toUpperCase()] || status;
  }

}
