import { Component, input } from '@angular/core';
import { totales } from '../../../core/models/iniciativa-model';

@Component({
  selector: 'app-kpis',
  imports: [],
  templateUrl: './kpis.html',
  styleUrl: './kpis.scss',
})
export class Kpis {
  kpisData = input<totales>();
}
