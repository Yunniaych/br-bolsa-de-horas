import { Component, inject, signal, OnInit } from '@angular/core';
import { Kpis } from '../componentes/kpis/kpis';
import { Graficas } from '../componentes/graficas/graficas';
import { IniciativaService } from '../../iniciativas/services/iniciativa-service';
import { totales } from '../../core/models/iniciativa-model';

@Component({
  selector: 'app-dashboard-page',
  imports: [Kpis, Graficas],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  iniciativaService = inject(IniciativaService);

  data = signal<totales>({
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

  horasPorMes = signal<{ mes: string; horas: number }[]>([]);

  ngOnInit() {
    this.iniciativaService.getTotales().subscribe((totales) => {
      this.data.set(totales);
    });

    this.iniciativaService.getHorasPorMes().subscribe((horas) => {
      this.horasPorMes.set(horas);
    });
  }
}
