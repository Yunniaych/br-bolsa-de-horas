import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolsasService } from './bolsas-service';

describe('BolsasService', () => {
  let component: BolsasService;
  let fixture: ComponentFixture<BolsasService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BolsasService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BolsasService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
