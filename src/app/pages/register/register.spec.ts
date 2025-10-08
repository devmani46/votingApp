import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [Register, ReactiveFormsModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have all form controls', () => {
    const form = component.form;
    expect(form.contains('firstName')).toBeTrue();
    expect(form.contains('lastName')).toBeTrue();
    expect(form.contains('username')).toBeTrue();
    expect(form.contains('email')).toBeTrue();
    expect(form.contains('password')).toBeTrue();
    expect(form.contains('confirmPassword')).toBeTrue();
  });

  it('should make fields required', () => {
    const firstName = component.form.get('firstName');
    firstName?.setValue('');
    expect(firstName?.valid).toBeFalse();

    const email = component.form.get('email');
    email?.setValue('');
    expect(email?.valid).toBeFalse();
  });

  it('should validate email format', () => {
    const email = component.form.get('email');
    email?.setValue('invalidEmail');
    expect(email?.valid).toBeFalse();

    email?.setValue('test@example.com');
    expect(email?.valid).toBeTrue();
  });

  it('should invalidate when passwords do not match', () => {
    const password = component.form.get('password');
    const confirmPassword = component.form.get('confirmPassword');

    password?.setValue('Password123');
    confirmPassword?.setValue('NotMatching');

    // assume you have a custom validator that sets `mismatch`
    expect(confirmPassword?.hasError('mismatch')).toBeTrue();
  });

  it('should call onSubmit when form is valid', () => {
    spyOn(component, 'onSubmit');

    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });

    const button = fixture.debugElement.query(By.css('app-button'));
    button.triggerEventHandler('click', null);

    expect(component.onSubmit).toHaveBeenCalled();
  });
});
