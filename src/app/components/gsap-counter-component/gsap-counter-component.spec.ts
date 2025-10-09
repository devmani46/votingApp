import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsapCounterComponent } from './gsap-counter-component';

describe('GsapCounterComponent', () => {
  let component: GsapCounterComponent;
  let fixture: ComponentFixture<GsapCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GsapCounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GsapCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
