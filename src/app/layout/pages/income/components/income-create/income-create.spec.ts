import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeCreate } from './income-create';

describe('IncomeCreate', () => {
  let component: IncomeCreate;
  let fixture: ComponentFixture<IncomeCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
