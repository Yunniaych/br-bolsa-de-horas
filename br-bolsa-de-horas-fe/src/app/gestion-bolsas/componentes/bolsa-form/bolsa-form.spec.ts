import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolsaForm } from './bolsa-form';

describe('BolsaForm', () => {
  let component: BolsaForm;
  let fixture: ComponentFixture<BolsaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BolsaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BolsaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
