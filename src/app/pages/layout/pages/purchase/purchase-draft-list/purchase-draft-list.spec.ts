import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseDraftList } from './purchase-draft-list';

describe('PurchaseDraftList', () => {
  let component: PurchaseDraftList;
  let fixture: ComponentFixture<PurchaseDraftList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseDraftList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseDraftList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
