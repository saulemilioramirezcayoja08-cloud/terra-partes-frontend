import {Component, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../modules/auth/services/auth.service';
import {ApiResponse} from '../../core/models/api-response.model';
import {LoginResponse} from '../../modules/auth/post/models/login-response.model';
import {HttpResponse} from '@angular/common/http';
import {ErrorResponse} from '../../core/models/error-response.model';
import {ErrorHandlerService} from '../../core/services/error-handler.service';

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
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {
  }

  onSubmit() {
    if (!this.username.trim() || !this.password.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    this.isLoading.set(true);

    this.authService.login({
      username: this.username.trim(),
      password: this.password.trim()
    }).subscribe({
      next: (res: HttpResponse<ApiResponse<LoginResponse>>) => {
        if (res.body?.success && res.body?.data) {
          this.authService.currentUser = res.body.data;
          alert('Inicio de sesión exitoso');
          this.router.navigateByUrl('/');
        } else {
          alert('Error inesperado al iniciar sesión');
        }
        this.isLoading.set(false);
      },
      error: (errorResponse: ErrorResponse) => {
        const message = this.errorHandler.handleError(errorResponse, 'Error al iniciar sesión');
        alert(message);
        this.isLoading.set(false);
      }
    });
  }
}
