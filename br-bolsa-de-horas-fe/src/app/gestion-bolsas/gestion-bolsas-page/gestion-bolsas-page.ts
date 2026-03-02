import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { BolsaCard } from '../componentes/bolsa-card/bolsa-card';
import {
  BolsasService,
  BolsaHoras,
} from '../services/bolsas-service/bolsas-service';
import { Dialog } from '@angular/cdk/dialog';
import {
  BolsaForm,
  BolsaDialogData,
} from '../componentes/bolsa-form/bolsa-form';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { IniciativaService } from '../../iniciativas/services/iniciativa-service';
import { AuthService } from '../../core/services/auth.service';
import { DatePickerDirective } from '../../shared/directives/date-picker-directive';

@Component({
  selector: 'app-gestion-bolsas-page',
  imports: [BolsaCard, DatePickerDirective],
  templateUrl: './gestion-bolsas-page.html',
  styleUrl: './gestion-bolsas-page.scss',
})
export class GestionBolsasPage implements OnInit {
  iniciativaService = inject(IniciativaService);
  bolsasService = inject(BolsasService);
  dialog = inject(Dialog);
  authService = inject(AuthService);

  totalHoras = signal<number>(0);

  // Dataset completo (más nuevo primero)
  private _bolsas = signal<BolsaHoras[]>([]);

  // Señales de filtro
  fechaFiltroInicio = signal<string | undefined>(undefined);
  fechaFiltroFin = signal<string | undefined>(undefined);
  /** Incrementar para disparar fp.clear() en ambos date pickers */
  clearCounter = signal<number>(0);

  /**
   * Bolsas visibles: filtradas por solapamiento de vigencia con el rango seleccionado.
   * Solapamiento: bolsa.fechaInicio <= fechaFin Y bolsa.fechaFin >= fechaInicio
   */
  bolsas = computed(() => {
    const inicio = this.fechaFiltroInicio();
    const fin = this.fechaFiltroFin();
    const all = this._bolsas();

    if (!inicio && !fin) return all;

    const iniDate = inicio ? this._parseDate(inicio) : null;
    const finDate = fin ? this._parseDate(fin) : null;

    return all.filter((b) => {
      const bInicio = this._parseDate(b.fechaInicio.substring(0, 10));
      const bFin = this._parseDate(b.fechaFin.substring(0, 10));

      // Excluir si la bolsa termina antes de que empiece el rango
      if (finDate && bInicio > finDate) return false;
      // Excluir si la bolsa empieza después de que termine el rango
      if (iniDate && bFin < iniDate) return false;
      return true;
    });
  });

  isAdmin = signal<boolean>(false);

  ngOnInit() {
    this.isAdmin.set(this.authService.isAdmin());
    this.loadTotales();
    this.loadBolsas();
  }

  loadTotales() {
    const inicio = this.fechaFiltroInicio();
    const fin = this.fechaFiltroFin();

    if (!inicio && !fin) {
      this.iniciativaService.getTotales().subscribe((totales) => {
        this.totalHoras.set(totales.bolsaHorasContratadas);
      });
    } else {
      this.iniciativaService
        .getTotalesPorFecha(inicio, fin)
        .subscribe((totales) => {
          this.totalHoras.set(totales.bolsaHorasContratadas);
        });
    }
  }

  loadBolsas() {
    this.bolsasService.getBolsas().subscribe((bolsas) => {
      // Más nuevo primero (id descendente)
      const sorted = bolsas
        .slice()
        .sort((a, b) => (b.idBolsa ?? 0) - (a.idBolsa ?? 0));
      this._bolsas.set(sorted);
    });
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
    const dialogRef = this.dialog.open<BolsaHoras, BolsaDialogData>(BolsaForm, {
      width: '800px',
      data: {
        mode: 'create',
      },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.loadBolsas();
        this.loadTotales();
      }
    });
  }

  openEditDialog(bolsa: BolsaHoras) {
    const dialogRef = this.dialog.open<BolsaHoras, BolsaDialogData>(BolsaForm, {
      width: '800px',
      data: {
        mode: 'edit',
        bolsa: bolsa,
      },
    });

    dialogRef.closed.subscribe((result) => {
      if (result) {
        this.loadBolsas();
        this.loadTotales();
      }
    });
  }

  onCloseDialog() {
    this.dialog.closeAll();
  }

  onEditBolsa(id: number) {
    const bolsa = this._bolsas().find((b) => b.idBolsa === id);
    if (bolsa) {
      this.openEditDialog(bolsa);
    }
  }

  onDeleteBolsa(id: number) {
    const bolsa = this._bolsas().find((i) => i.idBolsa === id);
    const mensaje = bolsa
      ? `¿Está seguro de eliminar la bolsa "${bolsa.nombreBolsa}"?`
      : '¿Está seguro de eliminar esta bolsa?';

    const confirmDialog = this.dialog.open<
      boolean,
      { mensaje: string; header: string }
    >(ConfirmDialog, {
      data: { mensaje: mensaje, header: 'Confirmar eliminación' },
    });

    confirmDialog.closed.subscribe((result) => {
      if (result) {
        this.bolsasService.deleteBolsa(id).subscribe(() => {
          this.loadBolsas();
          this.loadTotales();
        });
      }
    });
  }
}
