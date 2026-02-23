import { Component, input, Input } from '@angular/core';
import { totales } from '../../../core/models/iniciativa-model';

@Component({
  selector: 'app-totales',
  templateUrl: './totales.html',
  styleUrl: './totales.scss',
})
export class Totales {
  totales = input<totales>({
    mandayReservadas: 0,
    horasReservadas: 0,
    mandayConsumidas: 0,
    horasConsumidas: 0,
    mandayAprobadasDisponibles: 0,
    horasAprobadasDisponibles: 0,
    bolsaHorasContratadas: 0,
    bolsaMandayContratados: 0,
    horasDisponibles: 0,
    mandayDisponibles: 0,
  });
}
