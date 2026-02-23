import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionBolsasPage } from './gestion-bolsas-page';

describe('GestionBolsasPage', () => {
  let component: GestionBolsasPage;
  let fixture: ComponentFixture<GestionBolsasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionBolsasPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionBolsasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
