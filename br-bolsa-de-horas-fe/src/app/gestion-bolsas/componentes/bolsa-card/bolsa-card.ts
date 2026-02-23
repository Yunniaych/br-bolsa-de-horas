import { Component, input, inject, output } from '@angular/core';
import { bolsaHoras } from '../../../core/models/iniciativa-model';
import { DatePipe } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { BolsasService } from '../../services/bolsas-service/bolsas-service';

@Component({
  selector: 'app-bolsa-card',
  imports: [DatePipe],
  templateUrl: './bolsa-card.html',
  styleUrl: './bolsa-card.scss',
})
export class BolsaCard {
  bolsa = input<bolsaHoras>();
  isAdmin = input<boolean>(false);
  dialog = inject(Dialog);
  iniciativaService = inject(BolsasService);

  editBolsa = output<number>();
  deleteBolsa = output<number>();

  onEditBolsa(id: number | undefined) {
    if (id !== undefined) {
      this.editBolsa.emit(id);
    }
  }

  onDeleteBolsa(id: number | undefined) {
    if (id !== undefined) {
      this.deleteBolsa.emit(id);
    }
  }
}
