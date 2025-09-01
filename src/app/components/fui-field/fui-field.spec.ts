import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuiField } from './fui-field';

describe('FuiField', () => {
  let component: FuiField;
  let fixture: ComponentFixture<FuiField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuiField]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuiField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
