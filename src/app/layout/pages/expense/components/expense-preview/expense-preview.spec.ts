import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePreview } from './expense-preview';

describe('ExpensePreview', () => {
  let component: ExpensePreview;
  let fixture: ComponentFixture<ExpensePreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensePreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensePreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
