import { Component, inject, OnInit } from '@angular/core';
import { iniciativaModel } from '../../../core/models/iniciativa-model';
import { IniciativaService } from '../../services/iniciativa-service';
import { EstadosService, Estado } from '../../../core/services/estados.service';
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

export interface IniciativaDialogData {
  iniciativa?: iniciativaModel;
  mode: 'create' | 'edit';
  maxManDays: number;
}

@Component({
  selector: 'app-iniciativas-form',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './iniciativas-form.html',
  styleUrl: './iniciativas-form.scss',
})
export class IniciativasForm implements OnInit {
  iniciativaService = inject(IniciativaService);
  totales = this.iniciativaService.getTotales();
  estadosService = inject(EstadosService);
  estadosDisponibles: Estado[] = [];

  private fb = inject(FormBuilder);

  dialogRef = inject(DialogRef<iniciativaModel>);
  data: IniciativaDialogData = inject(DIALOG_DATA);

  iniciativaForm!: FormGroup;
  isEditMode = false;
  private isCalculating = false;
  private initialFormValues: any;

  constructor() {
    this.isEditMode = this.data.mode === 'edit';
  }

  ngOnInit() {
    // Create form synchronously so template bindings don't try to access undefined controls
    this.initForm();
    this.setupFormListeners();

    this.estadosService.getEstadosIniciativa().subscribe((estados) => {
      this.estadosDisponibles = estados;
      // debug logs removed

      // If form has no idEstado yet, set a sensible default from loaded estados
      const currentId = this.iniciativaForm.get('idEstado')?.value;
      if ((currentId === null || currentId === undefined) && this.estadosDisponibles.length > 0) {
        this.iniciativaForm.patchValue({ idEstado: this.estadosDisponibles[0].idEstado }, { emitEvent: false });
      }

      if (this.isEditMode && this.data.iniciativa) {
        this.loadIniciativaData(this.data.iniciativa);
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
    this.iniciativaForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        fechaAprobada: [today, [Validators.required, this.maxDateValidator()]],
        idEstado: [defaultEstado, Validators.required],
        manDayReserva: [
          1,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(this.data.maxManDays),
          ],
        ],
        HorasReservadas: [8, [Validators.required, Validators.min(0)]],
        ManDayConsumidos: [0, [Validators.required, Validators.min(0)]],
        HorasConsumidas: [0, [Validators.required, Validators.min(0)]],
      },
      {
        validators: [this.consumidosNoExcedanReservados()],
      },
    );
  }

  private setupFormListeners() {
    this.iniciativaForm
      .get('manDayReserva')
      ?.valueChanges.subscribe((manDay) => {
        if (!this.isCalculating && manDay !== null) {
          this.isCalculating = true;
          const horas = manDay * 8;
          this.iniciativaForm.patchValue(
            { HorasReservadas: horas },
            { emitEvent: false },
          );
          this.isCalculating = false;
        }
      });

    this.iniciativaForm
      .get('HorasReservadas')
      ?.valueChanges.subscribe((horas) => {
        if (!this.isCalculating && horas !== null) {
          this.isCalculating = true;
          const manDay = horas / 8;
          this.iniciativaForm.patchValue(
            { manDayReserva: manDay },
            { emitEvent: false },
          );
          this.isCalculating = false;
        }
      });

    this.iniciativaForm
      .get('ManDayConsumidos')
      ?.valueChanges.subscribe((manDay) => {
        if (!this.isCalculating && manDay !== null) {
          this.isCalculating = true;
          const horas = manDay * 8;
          this.iniciativaForm.patchValue(
            { HorasConsumidas: horas },
            { emitEvent: false },
          );
          this.checkCompletado();
          this.isCalculating = false;
        }
      });

    this.iniciativaForm
      .get('HorasConsumidas')
      ?.valueChanges.subscribe((horas) => {
        if (!this.isCalculating && horas !== null) {
          this.isCalculating = true;
          const manDay = horas / 8;
          this.iniciativaForm.patchValue(
            { ManDayConsumidos: manDay },
            { emitEvent: false },
          );
          this.checkCompletado();
          this.isCalculating = false;
        }
      });

    this.iniciativaForm
      .get('idEstado')
      ?.valueChanges.subscribe((idEstadoRaw) => {
        if (this.isCalculating) return;
        const idEstado = Number(idEstadoRaw);
        const estadoObj = this.estadosDisponibles.find(
          (e) => e.idEstado === idEstado,
        );
        const reservados = Number(
          this.iniciativaForm.get('manDayReserva')?.value || 0,
        );
        const horasReservadas = Number(
          this.iniciativaForm.get('HorasReservadas')?.value || 0,
        );

        if (estadoObj && estadoObj.descripcion === 'Completado') {
          this.isCalculating = true;
          // Set consumed to reserved and disable inputs to prevent edits
          this.iniciativaForm.patchValue(
            { ManDayConsumidos: reservados, HorasConsumidas: horasReservadas },
            { emitEvent: false },
          );
          this.iniciativaForm
            .get('ManDayConsumidos')
            ?.disable({ emitEvent: false });
          this.iniciativaForm
            .get('HorasConsumidas')
            ?.disable({ emitEvent: false });
          this.isCalculating = false;
        } else {
          // If moving away from completed, ensure consumed fields are enabled
          this.iniciativaForm
            .get('ManDayConsumidos')
            ?.enable({ emitEvent: false });
          this.iniciativaForm
            .get('HorasConsumidas')
            ?.enable({ emitEvent: false });
        }
      });

    // Also ensure that initial change of consumed values triggers estado change when equal to reservados
    // (subscriptions above already call checkCompletado after syncing ManDay/Horas consumed).
  }

  private checkCompletado() {
    const reservados = Number(
      this.iniciativaForm.get('manDayReserva')?.value || 0,
    );
    const consumidos = Number(
      this.iniciativaForm.get('ManDayConsumidos')?.value || 0,
    );
    const idEstadoActual = this.iniciativaForm.get('idEstado')?.value;
    const estadoObj = this.estadosDisponibles.find(
      (e) => e.idEstado === idEstadoActual,
    );
    const estadoCompletado = this.estadosDisponibles.find(
      (e) => e.descripcion === 'Completado',
    );

    const EPS = 1e-6;

    // If consumidos equals reservados (and >0) -> mark as Completado (use tolerance)
    if (reservados > 0 && Math.abs(consumidos - reservados) <= EPS) {
      if (estadoCompletado && idEstadoActual !== estadoCompletado.idEstado) {
        this.isCalculating = true;
        this.iniciativaForm.patchValue(
          { idEstado: estadoCompletado.idEstado },
          { emitEvent: false },
        );
        this.iniciativaForm
          .get('ManDayConsumidos')
          ?.disable({ emitEvent: false });
        this.iniciativaForm
          .get('HorasConsumidas')
          ?.disable({ emitEvent: false });
        this.isCalculating = false;
      }
      return;
    }

    // If consumidos less than reservados and current state is 'Completado', revert to previous or default non-completed state
    if (
      consumidos + EPS < reservados &&
      estadoCompletado &&
      idEstadoActual === estadoCompletado.idEstado
    ) {
      this.isCalculating = true;
      // try to restore initial idEstado if available and different
      const initialId = this.initialFormValues?.idEstado;
      if (initialId && initialId !== idEstadoActual) {
        this.iniciativaForm.patchValue(
          { idEstado: initialId },
          { emitEvent: false },
        );
      } else {
        // fallback: pick first estado that's not 'Completado'
        const fallback = this.estadosDisponibles.find(
          (e) => e.descripcion !== 'Completado',
        );
        if (fallback)
          this.iniciativaForm.patchValue(
            { idEstado: fallback.idEstado },
            { emitEvent: false },
          );
      }
      this.iniciativaForm.get('ManDayConsumidos')?.enable({ emitEvent: false });
      this.iniciativaForm.get('HorasConsumidas')?.enable({ emitEvent: false });
      this.isCalculating = false;
    }
  }

  private loadIniciativaData(iniciativa: iniciativaModel) {
    const fechaFormatted = this.formatDateToDisplay(
      new Date(iniciativa.fechaAprobada).toISOString().split('T')[0],
    );
    const estadoObj = this.estadosDisponibles.find(
      (e) => e.idEstado === iniciativa.idEstado,
    );
    // Avoid triggering valueChanges reactions while patching initial data
    this.isCalculating = true;
    this.iniciativaForm.patchValue(
      {
        nombre: iniciativa.nombre,
        fechaAprobada: fechaFormatted,
        idEstado: estadoObj ? estadoObj.idEstado : null,
        manDayReserva: iniciativa.mandayReservadas,
        HorasReservadas: iniciativa.horasReservadas,
        ManDayConsumidos: iniciativa.mandayConsumidos,
        HorasConsumidas: iniciativa.horasConsumidas,
      },
      { emitEvent: false },
    );
    // Keep consumed fields enabled on initial load so user can edit even if previously 'Completado'
    this.iniciativaForm.get('ManDayConsumidos')?.enable({ emitEvent: false });
    this.iniciativaForm.get('HorasConsumidas')?.enable({ emitEvent: false });
    this.iniciativaForm.get('fechaAprobada')?.disable({ emitEvent: false });
    this.initialFormValues = this.iniciativaForm.getRawValue();
    this.isCalculating = false;
  }

  private maxDateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const isoDate = this.formatDateToISO(control.value);
      if (!isoDate) return { invalidDate: true };

      const selectedDate = new Date(isoDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate > today ? { futureDate: true } : null;
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

    this.iniciativaForm.get(controlName)?.setValue(value, { emitEvent: false });
    input.value = value;
  }

  private consumidosNoExcedanReservados() {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const reservados = formGroup.get('manDayReserva')?.value || 0;
      const consumidos = formGroup.get('ManDayConsumidos')?.value || 0;

      return consumidos > reservados ? { consumidosExcedidos: true } : null;
    };
  }

  get disponibles() {
    const reservados = this.iniciativaForm.get('manDayReserva')?.value || 0;
    const consumidos = this.iniciativaForm.get('ManDayConsumidos')?.value || 0;
    const horasReservadas =
      this.iniciativaForm.get('HorasReservadas')?.value || 0;
    const horasConsumidas =
      this.iniciativaForm.get('HorasConsumidas')?.value || 0;

    return {
      mandayAprobadasDisponibles: Math.max(0, reservados - consumidos),
      horasAprobadasDisponibles: Math.max(0, horasReservadas - horasConsumidas),
    };
  }

  onSubmit() {
    if (this.iniciativaForm.valid) {
      const formValue = this.iniciativaForm.getRawValue();

      // Convertir fecha de DD/MM/YYYY a Date object
      const fechaAprobadaISO = this.formatDateToISO(formValue.fechaAprobada);

      if (!fechaAprobadaISO) {
        alert('Por favor, ingrese una fecha válida en formato DD/MM/AAAA');
        return;
      }

      const iniciativa: Omit<iniciativaModel, 'id'> = {
        ...formValue,
        fechaAprobada: new Date(fechaAprobadaISO),
        mandayAprobadasDisponibles: this.disponibles.mandayAprobadasDisponibles,
        horasAprobadasDisponibles: this.disponibles.horasAprobadasDisponibles,
        estado: undefined, // No enviar string estado, solo idEstado
      };

      if (this.isEditMode && this.data.iniciativa) {
        const updatedIniciativa: iniciativaModel = {
          id: this.data.iniciativa.id,
          nombre: formValue.nombre,
          fechaAprobada: new Date(fechaAprobadaISO),
          idEstado: Number(formValue.idEstado),
          mandayReservadas: Number(
            formValue.mandayReservadas ?? formValue.manDayReserva ?? 0,
          ),
          horasReservadas: Number(
            formValue.horasReservadas ?? formValue.HorasReservadas ?? 0,
          ),
          mandayConsumidos: Number(
            formValue.mandayConsumidos ?? formValue.ManDayConsumidos ?? 0,
          ),
          horasConsumidas: Number(
            formValue.horasConsumidas ?? formValue.HorasConsumidas ?? 0,
          ),
          mandayAprobadasDisponibles: Number(
            this.disponibles.mandayAprobadasDisponibles,
          ),
          horasAprobadasDisponibles: Number(
            this.disponibles.horasAprobadasDisponibles,
          ),
        };
        this.iniciativaService
          .updateIniciativa(updatedIniciativa)
          .subscribe(() => {
            this.dialogRef.close(updatedIniciativa);
          });
      } else {
        const nuevaIniciativa: Partial<iniciativaModel> = iniciativa;
        this.iniciativaService
          .postIniciativa(nuevaIniciativa as iniciativaModel)
          .subscribe((result) => {
            this.dialogRef.close(result);
          });
      }
    } else {
      // form invalid - debug log removed
      this.iniciativaForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  hasFormChanged(): boolean {
    if (!this.isEditMode) return true;
    if (!this.initialFormValues) return false;

    const currentValues = this.iniciativaForm.getRawValue();
    return (
      JSON.stringify(currentValues) !== JSON.stringify(this.initialFormValues)
    );
  }

  preventNegativeInput(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Enter',
    ];

    const isNumber = /^[0-9]$/.test(event.key);
    const isAllowedKey = allowedKeys.includes(event.key);
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;

    if (!isNumber && event.key !== '.' && !isAllowedKey) {
      event.preventDefault();
      return;
    }

    // Prevenir múltiples puntos decimales
    if (event.key === '.' && currentValue.includes('.')) {
      event.preventDefault();
      return;
    }
  }
}
