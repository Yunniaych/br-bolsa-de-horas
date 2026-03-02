import {
  Directive,
  ElementRef,
  inject,
  input,
  output,
  effect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es';
import { Instance } from 'flatpickr/dist/types/instance';

@Directive({
  selector: '[appDatePickerDirective]',
})
export class DatePickerDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private fp!: Instance;

  minDate = input<Date | string | undefined>(undefined);
  maxDate = input<Date | string | undefined>(undefined);
  defaultDate = input<Date | string | undefined>(undefined);
  /** Incrementar este valor para limpiar el picker programáticamente */
  clearTrigger = input<number>(0);
  dateChange = output<string | null>();

  constructor() {
    // Cuando clearTrigger cambia (> 0), limpiar la instancia de flatpickr
    effect(() => {
      const trigger = this.clearTrigger();
      if (trigger > 0 && this.fp) {
        this.fp.clear();
      }
    });

    // Cuando defaultDate cambia después de la inicialización (ej: datos async en edit mode)
    effect(() => {
      const date = this.defaultDate();
      if (date && this.fp) {
        this.fp.setDate(date, false);
      }
    });
  }

  ngOnInit() {
    console.log('Directiva iniciada en:', this.el.nativeElement);

    const inputEl = this.el.nativeElement.querySelector('input');
    console.log('Input encontrado:', inputEl);

    const toggleEl = this.el.nativeElement.querySelector('[data-toggle]');
    console.log('Toggle encontrado:', toggleEl);

    if (inputEl) {
      inputEl.addEventListener('input', (e: Event) => {
        const input = e.target as HTMLInputElement;
        let val = input.value.replace(/\D/g, '');
        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
        if (val.length >= 5) val = val.slice(0, 5) + '/' + val.slice(5);
        if (val.length > 10) val = val.slice(0, 10);
        input.value = val;
      });
    }

    this.fp = flatpickr(this.el.nativeElement, {
      locale: Spanish,
      dateFormat: 'd/m/Y',
      allowInput: true,
      wrap: true,
      disableMobile: true,
      minDate: this.minDate(),
      maxDate: this.maxDate(),
      defaultDate: this.defaultDate(),
      // Evitar que flatpickr parsee ISO strings como UTC midnight.
      // new Date("2026-03-02") → UTC midnight → en UTC-4 muestra día anterior.
      // Con esta override, "2026-03-02" crea new Date(2026,2,2) = medianoche LOCAL.
      parseDate: (dateStr: string) => {
        if (dateStr === 'today') return new Date();
        const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
          return new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]);
        }
        return new Date(dateStr);
      },
      onChange: (dates, dateStr) => {
        if (!dates[0] || !dateStr) {
          this.dateChange.emit(null);
          return;
        }
        // dateStr is already in 'd/m/Y' format (e.g. "05/03/2026").
        // Parse it back to YYYY-MM-DD without creating a Date object,
        // avoiding all timezone / UTC-midnight off-by-one issues.
        const parts = dateStr.split('/'); // [dd, mm, yyyy]
        this.dateChange.emit(`${parts[2]}-${parts[1]}-${parts[0]}`);
      },
    }) as Instance;

    console.log('Flatpickr instancia:', this.fp);
  }

  /** Establece una fecha en la instancia de flatpickr de forma programática. */
  setDate(date: Date | string) {
    this.fp?.setDate(date, false);
  }

  ngOnDestroy() {
    this.fp?.destroy();
  }
}
