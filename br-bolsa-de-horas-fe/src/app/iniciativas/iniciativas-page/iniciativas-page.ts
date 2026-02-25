import { Component, inject, signal, OnInit } from '@angular/core';
import { TablaIniciativas } from '../componentes/tabla-iniciativas/tabla-iniciativas';
import { iniciativaModel, totales } from '../../core/models/iniciativa-model';
import { IniciativaService } from '../services/iniciativa-service';
import { Totales } from '../componentes/totales/totales';
import {
  IniciativasForm,
  IniciativaDialogData,
} from '../componentes/iniciativas-form/iniciativas-form';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-iniciativas-page',
  imports: [TablaIniciativas, Totales],
  templateUrl: './iniciativas-page.html',
  styleUrl: './iniciativas-page.scss',
})
export class IniciativasPage implements OnInit {
  iniciativaService = inject(IniciativaService);
  dialog = inject(Dialog);
  authService = inject(AuthService);

  iniciativas = signal<iniciativaModel[]>([]);
  maxManDays = signal<number>(0);
  totalesData = signal<totales>({
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
  isAdmin = signal<boolean>(false);

  ngOnInit() {
    this.isAdmin.set(this.authService.isAdmin());
    this.loadIniciativas();
    this.loadTotales();
  }

  loadIniciativas() {
    this.iniciativaService.getIniciativas().subscribe((iniciativas) => {
      // Ensure stable order: older (smaller id) -> newer (larger id)
      const sorted = iniciativas
        .slice()
        .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
      this.iniciativas.set(sorted);
    });
  }

  loadTotales() {
    this.iniciativaService.getTotales().subscribe((totales) => {
      this.maxManDays.set(totales.mandayDisponibles);
      this.totalesData.set(totales);
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open<iniciativaModel, IniciativaDialogData>(
      IniciativasForm,
      {
        width: '800px',
        data: {
          mode: 'create',
          maxManDays: this.maxManDays(),
        },
      },
    );

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.loadIniciativas();
        this.loadTotales();
      }
    });
  }

  openEditDialog(iniciativa: iniciativaModel) {
    const dialogRef = this.dialog.open<iniciativaModel, IniciativaDialogData>(
      IniciativasForm,
      {
        width: '800px',
        data: {
          mode: 'edit',
          iniciativa: iniciativa,
          maxManDays: this.maxManDays() + iniciativa.mandayReservadas,
        },
      },
    );

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.loadIniciativas();
        this.loadTotales();
      }
    });
  }

  onCloseDialog() {
    this.dialog.closeAll();
  }

  onEditIniciativa(id: number) {
    const iniciativa = this.iniciativas().find((i) => i.id === id);
    if (iniciativa) {
      this.openEditDialog(iniciativa);
    }
  }

  onDeleteIniciativa(id: number) {
    const iniciativa = this.iniciativas().find((i) => i.id === id);
    const mensaje = iniciativa
      ? `¿Está seguro de eliminar la iniciativa "${iniciativa.nombre}"?`
      : '¿Está seguro de eliminar esta iniciativa?';

    const confirmDialog = this.dialog.open<
      boolean,
      { mensaje: string; header: string }
    >(ConfirmDialog, {
      data: { mensaje: mensaje, header: 'Confirmar eliminación' },
    });

    confirmDialog.closed.subscribe((result) => {
      if (result) {
        this.iniciativaService.deleteIniciativa(id).subscribe(() => {
          this.loadIniciativas();
          this.loadTotales();
        });
      }
    });
  }
}
