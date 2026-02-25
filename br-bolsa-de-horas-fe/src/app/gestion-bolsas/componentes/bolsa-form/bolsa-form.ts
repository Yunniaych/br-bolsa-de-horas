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
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  BolsasService,
  BolsaHoras,
} from '../../services/bolsas-service/bolsas-service';
import { DatePickerDirective } from '../../../shared/directives/date-picker-directive';


export interface BolsaDialogData {
  bolsa?: BolsaHoras;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-bolsa-form', 
  imports: [ReactiveFormsModule, DatePickerDirective],
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
    this.initForm([]);

    this.estadosService.getEstadosBolsa().subscribe((estados) => {
    this.estadosDisponibles = estados;
    
    // Actualizar solo el idEstado una vez que llegan los estados
    if (estados.length > 0) {
      this.bolsaForm.get('idEstado')?.setValue(estados[0].idEstado);
    }

    this.setupFormListeners();
    if (this.isEditMode && this.data.bolsa) {
      this.loadBolsaData(this.data.bolsa);
    }
  });
  }

  private initForm(estados: Estado[]) {
  const today = new Date();
  const defaultEstado = estados.length > 0 ? estados[0].idEstado : null;
  const fechaFinValidators = [Validators.required];
  if (!this.isEditMode) {
    fechaFinValidators.push(this.futureDateValidator());
  }
  this.bolsaForm = this.fb.group({
    nombreBolsa: ['', [Validators.required, Validators.minLength(3)]],
    fechaInicio: [today, [Validators.required]],
    fechaFin: [null as Date | null, fechaFinValidators],
    mandayContratados: [1, [Validators.required, Validators.min(1)]],
    horasContratadas: [8, [Validators.required, Validators.min(1)]],
    idEstado: [defaultEstado, Validators.required],
  });
}

  onFechaInicioChange(date: Date | null) {
    this.bolsaForm.get('fechaInicio')?.setValue(date);
  }

  onFechaFinChange(date: Date | null) {
    this.bolsaForm.get('fechaFin')?.setValue(date);
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
    this.bolsaForm.patchValue({
      nombreBolsa: bolsa.nombreBolsa,
      fechaInicio: bolsa.fechaInicio,
      fechaFin: bolsa.fechaFin,
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
      const selected = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected <= today ? { pastDate: true } : null;
    };
  }


  preventNegativeInput(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }

  onSubmit() {
    if (this.bolsaForm.valid) {
      const formValue = this.bolsaForm.value;


      if (this.isEditMode && this.data.bolsa) {
        const updatedBolsa: BolsaHoras = {
          idBolsa: this.data.bolsa.idBolsa as number,
          nombreBolsa: formValue.nombreBolsa,
          fechaInicio: formValue.fechaInicio,
          fechaFin: formValue.fechaFin,
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
          fechaInicio: formValue.fechaInicio,
          fechaFin: formValue.fechaFin,
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
