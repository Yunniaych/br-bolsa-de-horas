import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaIniciativas } from './tabla-iniciativas';

describe('TablaIniciativas', () => {
  let component: TablaIniciativas;
  let fixture: ComponentFixture<TablaIniciativas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaIniciativas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaIniciativas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
