import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { moderatorGuard } from './moderator-guard';

describe('moderatorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => moderatorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
