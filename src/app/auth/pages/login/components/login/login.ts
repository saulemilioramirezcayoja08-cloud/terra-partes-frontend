import {Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {LoginService} from '../../services/login-service';
import {delay} from 'rxjs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // dependencias
  private router = inject(Router);
  private login_service = inject(LoginService);

  // campos del formulario
  protected username = '';
  protected password = '';

  // estado
  protected loading = signal<boolean>(false);

  // indica si esta cargando
  protected is_loading(): boolean {
    return this.loading();
  }

  // valida que los campos no esten vacios
  protected is_valid_form(): boolean {
    return this.username.trim() !== '' && this.password.trim() !== '';
  }

  // envia formulario de login
  protected on_submit(): void {
    if (!this.is_valid_form()) {
      return;
    }

    this.loading.set(true);

    this.login_service.login({
      username: this.username,
      password: this.password
    }).pipe(
      delay(500)
    ).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log(response);

        if (response) {
          this.router.navigate(['/layout/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.message;
        alert(message);
      }
    });
  }
}
