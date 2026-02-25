import {
  Directive,
  ElementRef,
  inject,
  input,
  output,
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
  defaultDate = input<Date | undefined>(undefined);
  dateChange = output<Date | null>();

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
      onChange: (dates) => {
        console.log('Fecha seleccionada:', dates);
        this.dateChange.emit(dates[0] ?? null);
      },
    }) as Instance;

    console.log('Flatpickr instancia:', this.fp);
  }

  ngOnDestroy() {
    this.fp?.destroy();
  }
}
