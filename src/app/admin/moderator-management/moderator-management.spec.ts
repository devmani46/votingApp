import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeratorManagement } from './moderator-management';

describe('ModeratorManagement', () => {
  let component: ModeratorManagement;
  let fixture: ComponentFixture<ModeratorManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeratorManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(ModeratorManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
