import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionReport } from './commission-report';

describe('CommissionReport', () => {
  let component: CommissionReport;
  let fixture: ComponentFixture<CommissionReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommissionReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
