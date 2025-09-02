import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCampaign } from './create-campaign';

describe('CreateCampaign', () => {
  let component: CreateCampaign;
  let fixture: ComponentFixture<CreateCampaign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCampaign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCampaign);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
