import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCampaign } from './user-campaign';

describe('UserCampaign', () => {
  let component: UserCampaign;
  let fixture: ComponentFixture<UserCampaign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCampaign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCampaign);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
