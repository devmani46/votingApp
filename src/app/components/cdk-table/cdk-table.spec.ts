import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdkTable } from './cdk-table';

describe('CdkTable', () => {
  let component: CdkTable;
  let fixture: ComponentFixture<CdkTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdkTable],
    }).compileComponents();

    fixture = TestBed.createComponent(CdkTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
