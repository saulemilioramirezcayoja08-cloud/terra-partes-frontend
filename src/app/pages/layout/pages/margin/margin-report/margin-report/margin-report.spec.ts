import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarginReport } from './margin-report';

describe('MarginReport', () => {
  let component: MarginReport;
  let fixture: ComponentFixture<MarginReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarginReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarginReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
