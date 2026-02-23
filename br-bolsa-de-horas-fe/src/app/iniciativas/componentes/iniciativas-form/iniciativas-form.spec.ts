import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IniciativasForm } from './iniciativas-form';

describe('IniciativasForm', () => {
  let component: IniciativasForm;
  let fixture: ComponentFixture<IniciativasForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciativasForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IniciativasForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
