import { Component, input, output } from '@angular/core';
import { iniciativaModel } from '../../../core/models/iniciativa-model';
import { DatePipe } from '@angular/common';

interface TableColumn {
  header: string;
  field?: keyof iniciativaModel;
}
@Component({
  selector: 'app-tabla-iniciativas',
  imports: [DatePipe],
  templateUrl: './tabla-iniciativas.html',
  styleUrl: './tabla-iniciativas.scss',
})
export class TablaIniciativas {
  iniciativas = input<iniciativaModel[]>([]);
  isAdmin = input<boolean>(false);

  editIniciativa = output<number>();
  deleteIniciativa = output<number>();

  tableColumns: TableColumn[] = [
    { header: 'ID', field: 'id' },
    { header: 'Nombre iniciativa', field: 'nombre' },
    { header: 'Estado', field: 'estado' },
    { header: 'Fecha aprobada', field: 'fechaAprobada' },
    { header: 'Man Day Reservados', field: 'mandayReservadas' },
    { header: 'Horas Reservadas', field: 'horasReservadas' },
    { header: 'Man Day Consumidos', field: 'mandayConsumidos' },
    { header: 'Horas Consumidas', field: 'horasConsumidas' },
    { header: 'Man Day Aprob. Disp.', field: 'mandayAprobadasDisponibles' },
    { header: 'Horas Aprob. Disp.', field: 'horasAprobadasDisponibles' },
  ];

  get displayColumns(): TableColumn[] {
    return this.isAdmin()
      ? [...this.tableColumns, { header: 'Acciones' }]
      : this.tableColumns;
  }

  onEditIniciativa(id: number) {
    this.editIniciativa.emit(id);
  }

  onDeleteIniciativa(id: number) {
    this.deleteIniciativa.emit(id);
  }
}
