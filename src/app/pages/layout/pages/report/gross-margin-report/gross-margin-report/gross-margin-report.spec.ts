import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrossMarginReport } from './gross-margin-report';

describe('GrossMarginReport', () => {
  let component: GrossMarginReport;
  let fixture: ComponentFixture<GrossMarginReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrossMarginReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrossMarginReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
