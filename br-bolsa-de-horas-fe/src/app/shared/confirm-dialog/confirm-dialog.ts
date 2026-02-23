import { Component, input, inject } from '@angular/core';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

interface ConfirmDialogData {
  mensaje?: string;
  header?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  mensaje = '¿Estás seguro que deseas continuar?';
  header = 'Confirmar acción';
  dialog = inject(Dialog);
  dialogRef = inject(DialogRef);

  data: ConfirmDialogData = inject(DIALOG_DATA);

  constructor() {
    if (this.data.mensaje) {
      this.mensaje = this.data.mensaje;
    }
    if (this.data.header) {
      this.header = this.data.header;
    }
  }

}
