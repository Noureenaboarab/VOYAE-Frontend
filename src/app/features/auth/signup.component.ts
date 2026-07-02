import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

const EMAIL_REGEX = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,3}/;

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  const errors: Record<string, boolean> = {};

  if (value.length < 8) errors['minLength'] = true;
  if (!/[a-z]/.test(value)) errors['lowercase'] = true;
  if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
  if (!/\d/.test(value)) errors['number'] = true;
  if (!/[@$!%*?&]/.test(value)) errors['special'] = true;

  return Object.keys(errors).length ? errors : null;
}

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirm  = control.get('confirmPassword');
  if (!password || !confirm) return null;
  return password.value === confirm.value ? null : { passwordsMismatch: true };
};

@Component({
  selector: 'voy-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name:            ['', Validators.required],
    email:           ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
    password:        ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', Validators.required],
    birthday:        [''],
    job:             [''],
    gender:          [''],
    street:          [''],
    city:            [''],
    country:         [''],
    postalCode:      [''],
  }, { validators: passwordsMatchValidator });

  loading = signal(false);
  error   = signal<string | null>(null);

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { name, email, password, confirmPassword, birthday, job, gender, street, city, country, postalCode } = this.form.value;

    this.authService.register({
      name: name!,
      email: email!,
      password: password!,
      confirmPassword: confirmPassword!,
      birthday: birthday || undefined,
      job: job || undefined,
      gender: gender || undefined,
      street: street || undefined,
      city: city || undefined,
      country: country || undefined,
      postalCode: postalCode || undefined,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/account');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Could not create account. Please try again.';
        this.error.set(msg);
      },
    });
  }
}
