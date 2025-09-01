import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuiInput } from './fui-input';

describe('FuiInput', () => {
  let component: FuiInput;
  let fixture: ComponentFixture<FuiInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuiInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuiInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
