import { Component, signal, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-gestion-bolsas-page',
  imports: [BolsaCard],
  templateUrl: './gestion-bolsas-page.html',
  styleUrl: './gestion-bolsas-page.scss',
})
export class GestionBolsasPage implements OnInit {
  iniciativaService = inject(IniciativaService);
  bolsasService = inject(BolsasService);
  dialog = inject(Dialog);
  authService = inject(AuthService);

  totalHoras = signal<number>(0);
  bolsas = signal<BolsaHoras[]>([]);
  isAdmin = signal<boolean>(false);

  ngOnInit() {
    this.isAdmin.set(this.authService.isAdmin());
    this.loadTotales();
    this.loadBolsas();
  }

  loadTotales() {
    this.iniciativaService.getTotales().subscribe((totales) => {
      this.totalHoras.set(totales.bolsaHorasContratadas);
    });
  }

  loadBolsas() {
    this.bolsasService.getBolsas().subscribe((bolsas) => {
      // Ensure stable order: older (smaller idBolsa) -> newer (larger idBolsa)
      const sorted = bolsas
        .slice()
        .sort((a, b) => (a.idBolsa ?? 0) - (b.idBolsa ?? 0));
      this.bolsas.set(sorted);
    });
  }

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
    const bolsa = this.bolsas().find((b) => b.idBolsa === id);
    if (bolsa) {
      this.openEditDialog(bolsa);
    }
  }

  onDeleteBolsa(id: number) {
    const bolsa = this.bolsas().find((i) => i.idBolsa === id);
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
