import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationBlock } from './notification-block';

describe('NotificationBlock', () => {
  let component: NotificationBlock;
  let fixture: ComponentFixture<NotificationBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationBlock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationBlock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
