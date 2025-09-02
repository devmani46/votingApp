import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignStatus } from './campaign-status';

describe('CampaignStatus', () => {
  let component: CampaignStatus;
  let fixture: ComponentFixture<CampaignStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
