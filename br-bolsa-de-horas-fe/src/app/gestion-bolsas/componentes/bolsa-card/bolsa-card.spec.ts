import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolsaCard } from './bolsa-card';

describe('BolsaCard', () => {
  let component: BolsaCard;
  let fixture: ComponentFixture<BolsaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BolsaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BolsaCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
