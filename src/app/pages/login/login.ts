import {Component, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../core/services/auth.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {ApiResponse} from '../../core/models/api-response.model';
import {LoginResponse} from '../../core/models/login-response.model';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  isLoading = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
  }

  onSubmit() {
    if (!this.username.trim() || !this.password.trim()) {
      console.warn('[LOGIN] Campos vacíos');
      return;
    }

    this.isLoading.set(true);

    this.authService.login({
      username: this.username.trim(),
      password: this.password.trim()
    }).subscribe({
      next: (res: HttpResponse<ApiResponse<LoginResponse>>) => {
        console.group('[LOGIN][SUCCESS]');
        console.log('HTTP Status:', res.status, res.statusText);
        console.log('Headers:', res.headers?.keys().reduce((acc: any, k) => ({...acc, [k]: res.headers.get(k)}), {}));
        console.log('Body:', res.body);
        console.groupEnd();

        if (res.body?.success && res.body?.data) {
          this.authService.currentUser = res.body.data;
          this.router.navigateByUrl('/');
        }

        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.group('[LOGIN][ERROR]');
        console.log('HTTP Status:', err.status, err.statusText);
        console.log('Headers:', err.headers);
        console.log('Error Body:', err.error);
        console.log('Message:', err.message);
        console.groupEnd();

        this.isLoading.set(false);
      }
    });
  }
}
