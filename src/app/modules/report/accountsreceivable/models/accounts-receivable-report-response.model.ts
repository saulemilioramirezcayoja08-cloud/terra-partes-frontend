export interface AccountsReceivableReportResponse {
  resumen: Resumen;
  cuentas: Cuenta[];
}

export interface Resumen {
  totalPorCobrar: number;
  cantidadVentas: number;
  cantidadClientes: number;
  periodoDesde: string | null;
  periodoHasta: string | null;
}

export interface Cuenta {
  ventaId: number;
  ventaNumero: string;
  fechaVenta: string;
  cliente: Cliente;
  totalVenta: number;
  totalPagado: number;
  saldoPendiente: number;
  diasTranscurridos: number;
  formaPago: FormaPago | null;
}

export interface Cliente {
  id: number;
  nombre: string;
  taxId: string;
  telefono: string;
  email: string;
}

export interface FormaPago {
  id: number;
  codigo: string;
  nombre: string;
}