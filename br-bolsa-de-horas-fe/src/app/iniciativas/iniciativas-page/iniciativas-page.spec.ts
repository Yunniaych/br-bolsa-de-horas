import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IniciativasPage } from './iniciativas-page';

describe('IniciativasPage', () => {
  let component: IniciativasPage;
  let fixture: ComponentFixture<IniciativasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IniciativasPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IniciativasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
