import { EstadosService, Estado } from '../../../core/services/estados.service';
import { Component, inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  BolsasService,
  BolsaHoras,
} from '../../services/bolsas-service/bolsas-service';

export interface BolsaDialogData {
  bolsa?: BolsaHoras;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-bolsa-form',
  imports: [ReactiveFormsModule],
  templateUrl: './bolsa-form.html',
  styleUrl: './bolsa-form.scss',
})
export class BolsaForm implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(DialogRef<BolsaHoras>);
  data: BolsaDialogData = inject(DIALOG_DATA);
  bolsasService = inject(BolsasService);
  estadosService = inject(EstadosService);
  estadosDisponibles: Estado[] = [];

  bolsaForm!: FormGroup;
  isEditMode = false;
  private isCalculating = false;
  private initialFormValues: any;

  constructor() {
    this.isEditMode = this.data.mode === 'edit';
  }

  ngOnInit() {
    this.estadosService.getEstadosBolsa().subscribe((estados) => {
      this.estadosDisponibles = estados;
      this.initForm();
      this.setupFormListeners();
      if (this.isEditMode && this.data.bolsa) {
        this.loadBolsaData(this.data.bolsa);
      }
    });
  }

  private initForm() {
    const today = this.formatDateToDisplay(
      new Date().toISOString().split('T')[0],
    );
    const defaultEstado =
      this.estadosDisponibles.length > 0
        ? this.estadosDisponibles[0].idEstado
        : null;
    const fechaFinValidators = [Validators.required];
    if (!this.isEditMode) {
      fechaFinValidators.push(this.futureDateValidator());
    }
    this.bolsaForm = this.fb.group({
      nombreBolsa: ['', [Validators.required, Validators.minLength(3)]],
      fechaInicio: [today, [Validators.required]],
      fechaFin: ['', fechaFinValidators],
      mandayContratados: [1, [Validators.required, Validators.min(1)]],
      horasContratadas: [8, [Validators.required, Validators.min(1)]],
      idEstado: [defaultEstado, Validators.required],
    });
  }

  private setupFormListeners() {
    // Cuando cambia mandayContratados, calcular horas
    this.bolsaForm
      .get('mandayContratados')
      ?.valueChanges.subscribe((manDay) => {
        if (!this.isCalculating && manDay !== null) {
          this.isCalculating = true;
          const horas = manDay * 8;
          this.bolsaForm.patchValue(
            { horasContratadas: horas },
            { emitEvent: false },
          );
          this.isCalculating = false;
        }
      });

    // Cuando cambia horasContratadas, calcular man days
    this.bolsaForm.get('horasContratadas')?.valueChanges.subscribe((horas) => {
      if (!this.isCalculating && horas !== null) {
        this.isCalculating = true;
        const manDay = horas / 8;
        this.bolsaForm.patchValue(
          { mandayContratados: manDay },
          { emitEvent: false },
        );
        this.isCalculating = false;
      }
    });
  }

  private loadBolsaData(bolsa: BolsaHoras) {
    const fechaInicioFormatted = this.formatDateToDisplay(
      new Date(bolsa.fechaInicio).toISOString().split('T')[0],
    );
    const fechaFinFormatted = this.formatDateToDisplay(
      new Date(bolsa.fechaFin).toISOString().split('T')[0],
    );
    this.bolsaForm.patchValue({
      nombreBolsa: bolsa.nombreBolsa,
      fechaInicio: fechaInicioFormatted,
      fechaFin: fechaFinFormatted,
      mandayContratados: bolsa.mandayContratados,
      horasContratadas: bolsa.horasContratadas,
      idEstado: bolsa.idEstado,
    });
    // Guardar valores iniciales para detectar cambios
    this.initialFormValues = this.bolsaForm.value;
  }

  private futureDateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const isoDate = this.formatDateToISO(control.value);
      if (!isoDate) return { invalidDate: true };

      const selectedDate = new Date(isoDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate <= today ? { pastDate: true } : null;
    };
  }

  // Convierte DD/MM/YYYY a YYYY-MM-DD
  private formatDateToISO(dateStr: string): string | null {
    if (!dateStr) return null;

    // Si ya está en formato ISO (YYYY-MM-DD)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }

    // Si está en formato DD/MM/YYYY
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  // Convierte YYYY-MM-DD a DD/MM/YYYY
  private formatDateToDisplay(isoDate: string): string {
    if (!isoDate) return '';

    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }

    return isoDate;
  }

  // Auto-formatea mientras el usuario escribe
  formatDateInput(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Solo números

    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5);
    }
    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    this.bolsaForm.get(controlName)?.setValue(value, { emitEvent: false });
    input.value = value;
  }

  preventNegativeInput(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }

  onSubmit() {
    if (this.bolsaForm.valid) {
      const formValue = this.bolsaForm.value;

      // Convertir fechas de DD/MM/YYYY a Date objects
      const fechaInicioISO = this.formatDateToISO(formValue.fechaInicio);
      const fechaFinISO = this.formatDateToISO(formValue.fechaFin);

      if (!fechaInicioISO || !fechaFinISO) {
        alert('Por favor, ingrese fechas válidas en formato DD/MM/AAAA');
        return;
      }

      if (this.isEditMode && this.data.bolsa) {
        const updatedBolsa: BolsaHoras = {
          idBolsa: this.data.bolsa.idBolsa as number,
          nombreBolsa: formValue.nombreBolsa,
          fechaInicio: new Date(fechaInicioISO),
          fechaFin: new Date(fechaFinISO),
          mandayContratados: formValue.mandayContratados,
          horasContratadas: formValue.horasContratadas,
          idEstado: formValue.idEstado,
        };
        this.bolsasService.updateBolsa(updatedBolsa).subscribe(() => {
          this.dialogRef.close(updatedBolsa);
        });
      } else {
        const nuevaBolsa: Partial<BolsaHoras> = {
          nombreBolsa: formValue.nombreBolsa,
          fechaInicio: new Date(fechaInicioISO),
          fechaFin: new Date(fechaFinISO),
          mandayContratados: formValue.mandayContratados,
          horasContratadas: formValue.horasContratadas,
          idEstado: 1, // Estado "Activa"
        };
        this.bolsasService
          .postBolsa(nuevaBolsa as BolsaHoras)
          .subscribe((result) => {
            this.dialogRef.close(result);
          });
      }
    } else {
      console.log('Formulario inválido:', this.bolsaForm.errors);
      console.log(
        'Controles inválidos:',
        Object.keys(this.bolsaForm.controls).filter(
          (key) => this.bolsaForm.get(key)?.invalid,
        ),
      );
      this.bolsaForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  hasFormChanged(): boolean {
    if (!this.isEditMode) return true;
    if (!this.initialFormValues) return false;

    const currentValues = this.bolsaForm.value;
    return (
      JSON.stringify(currentValues) !== JSON.stringify(this.initialFormValues)
    );
  }
}
