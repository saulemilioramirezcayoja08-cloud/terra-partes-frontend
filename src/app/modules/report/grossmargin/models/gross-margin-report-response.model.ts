export interface GrossMarginReportResponse {
  resumen: Resumen;
  ventas: Venta[];
}

export interface Resumen {
  totalVentas: number;
  totalCostos: number;
  totalMargen: number;
  porcentajeMargen: number;
  totalPagado: number;
  totalPendiente: number;
  cantidadVentas: number;
  periodoDesde: string | null;
  periodoHasta: string | null;
}

export interface Venta {
  id: number;
  numero: string;
  fecha: string;
  cliente: string;
  metodoPago: string | null;
  usuario: Usuario;
  total: number;
  costo: number;
  margen: number;
  porcentajeMargen: number;
  pagado: number;
  pendiente: number;
}

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
}