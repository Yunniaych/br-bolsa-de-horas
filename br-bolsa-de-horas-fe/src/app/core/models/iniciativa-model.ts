export interface iniciativaModel {
  id: number;
  nombre: string;
  fechaAprobada: Date;
  idEstado: number;
  estado?: {
    idEstado: number;
    descripcion: string;
  };
  mandayReservadas: number;
  horasReservadas: number;
  mandayConsumidos: number;
  horasConsumidas: number;
  mandayAprobadasDisponibles: number;
  horasAprobadasDisponibles: number;
}

export interface estadoIniciativa {
  idEstado: number;
  descripcion: string;
}

export interface totales {
  mandayReservadas: number;
  horasReservadas: number;
  mandayConsumidas: number;
  horasConsumidas: number;
  mandayAprobadasDisponibles: number;
  horasAprobadasDisponibles: number;
  bolsaHorasContratadas: number;
  bolsaMandayContratados: number;
  horasDisponibles: number;
  mandayDisponibles: number;
}

export interface bolsaHoras {
  idBolsa: number;
  nombreBolsa: string;
  fechaInicio: Date;
  fechaFin: Date;
  horasContratadas: number;
  mandayContratados: number;
  idEstado: number;
  estado?: {
    idEstado: number;
    descripcion: string;
  };
}
