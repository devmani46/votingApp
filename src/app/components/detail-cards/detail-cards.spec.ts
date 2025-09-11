import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailCards } from './detail-cards';

describe('DetailCards', () => {
  let component: DetailCards;
  let fixture: ComponentFixture<DetailCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
