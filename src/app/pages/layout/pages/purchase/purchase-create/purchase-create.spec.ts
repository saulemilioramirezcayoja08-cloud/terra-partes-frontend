import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseCreate } from './purchase-create';

describe('PurchaseCreate', () => {
  let component: PurchaseCreate;
  let fixture: ComponentFixture<PurchaseCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
