import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
import { DatePickerDirective } from '../../shared/directives/date-picker-directive';
import { ExportExcelService } from '../services/export-excel.service';

@Component({
  selector: 'app-iniciativas-page',
  imports: [TablaIniciativas, Totales, DatePickerDirective],
  templateUrl: './iniciativas-page.html',
  styleUrl: './iniciativas-page.scss',
})
export class IniciativasPage implements OnInit {
  iniciativaService = inject(IniciativaService);
  dialog = inject(Dialog);
  authService = inject(AuthService);
  exportService = inject(ExportExcelService);

  isExporting = signal<boolean>(false);

  // Dataset completo (nunca se toca tras la carga)
  private _iniciativas = signal<iniciativaModel[]>([]);

  // Señales de filtro
  fechaFiltroInicio = signal<string | undefined>(undefined);
  fechaFiltroFin = signal<string | undefined>(undefined);
  /** Incrementar para disparar fp.clear() en ambos date pickers */
  clearCounter = signal<number>(0);

  /** Lista visible, filtrada por fecha_aprobada dentro del rango seleccionado */
  iniciativas = computed(() => {
    const inicio = this.fechaFiltroInicio();
    const fin = this.fechaFiltroFin();
    const all = this._iniciativas();

    if (!inicio && !fin) return all;

    const iniDate = inicio ? this._parseDate(inicio) : null;
    const finDate = fin ? this._parseDate(fin) : null;

    return all.filter((i) => {
      const f = this._parseDate(i.fechaAprobada.substring(0, 10));
      if (iniDate && f < iniDate) return false;
      if (finDate && f > finDate) return false;
      return true;
    });
  });

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
      const sorted = iniciativas
        .slice()
        .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
      this._iniciativas.set(sorted);
    });
  }

  loadTotales() {
    const inicio = this.fechaFiltroInicio();
    const fin = this.fechaFiltroFin();

    if (!inicio && !fin) {
      this.iniciativaService.getTotales().subscribe((totales) => {
        this.maxManDays.set(totales.mandayDisponibles);
        this.totalesData.set(totales);
      });
    } else {
      this.iniciativaService
        .getTotalesPorFecha(inicio, fin)
        .subscribe((totales) => {
          this.maxManDays.set(totales.mandayDisponibles);
          this.totalesData.set(totales);
        });
    }
  }

  // ──────────────── Filtro de fechas ────────────────

  onFechaInicioChange(date: string | null) {
    this.fechaFiltroInicio.set(date ?? undefined);
    this.loadTotales();
  }

  onFechaFinChange(date: string | null) {
    this.fechaFiltroFin.set(date ?? undefined);
    this.loadTotales();
  }

  limpiarFiltro() {
    this.fechaFiltroInicio.set(undefined);
    this.fechaFiltroFin.set(undefined);
    this.clearCounter.update((v) => v + 1);
    this.loadTotales();
  }

  // ──────────────── Exportar Excel ────────────────

  async exportarExcel() {
    this.isExporting.set(true);
    try {
      await this.exportService.exportar({
        fechaDesde: this.fechaFiltroInicio(),
        fechaHasta: this.fechaFiltroFin(),
        // Pasar los totales ya cargados para que el chart coincida exactamente
        // con los datos mostrados en pantalla
        totalesParaChart: this.totalesData(),
      });
    } catch (err) {
      console.error('[IniciativasPage] Error al exportar Excel:', err);
    } finally {
      this.isExporting.set(false);
    }
  }

  private _toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private _parseDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  // ──────────────── Dialogs ────────────────

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
    const iniciativa = this._iniciativas().find((i) => i.id === id);
    if (iniciativa) {
      this.openEditDialog(iniciativa);
    }
  }

  onDeleteIniciativa(id: number) {
    const iniciativa = this._iniciativas().find((i) => i.id === id);
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
