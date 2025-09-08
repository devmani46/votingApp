import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteCandidate } from './vote-candidate';

describe('VoteCandidate', () => {
  let component: VoteCandidate;
  let fixture: ComponentFixture<VoteCandidate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoteCandidate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoteCandidate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
