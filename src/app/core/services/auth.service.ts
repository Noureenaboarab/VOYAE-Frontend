import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'voyae_token';
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(
    localStorage.getItem(this.TOKEN_KEY)
  );

  readonly isAuthenticated = computed(() => this.token() !== null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', data).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.token.set(null);
    this.router.navigate(['/']);
  }

  private setToken(jwt: string): void {
    localStorage.setItem(this.TOKEN_KEY, jwt);
    this.token.set(jwt);
  }
}
