import {Component, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

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
  error = signal<string | null>(null);

  constructor(private router: Router) {
  }

  onSubmit() {

    if (this.username === 'emilio' && this.password === '1998') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', 'emilio-1998');
      }

      this.error.set(null);
      this.router.navigateByUrl('/');
    } else {
      console.warn('Credenciales incorrectas');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      this.error.set('Usuario o contraseña inválidos.');
    }
  }
}
