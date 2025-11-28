export interface CommissionReportResponse {
  resumen: Resumen;
  comisiones: Comision[];
}

export interface Resumen {
  totalPendiente: number;
  totalPagado: number;
  cantidadPendiente: number;
  cantidadPagada: number;
  periodoDesde: string | null;
  periodoHasta: string | null;
}

export interface Comision {
  id: number;
  ventaId: number;
  ventaNumero: string;
  fechaVenta: string;
  cliente: string;
  totalVenta: number;
  costoVenta: number;
  margenBruto: number;
  porcentajeComision: number;
  montoComision: number;
  estado: string;
  vendedor: Vendedor;
  fechaCreacion: string;
  fechaPago: string | null;
}

export interface Vendedor {
  id: number;
  username: string;
  nombre: string;
}