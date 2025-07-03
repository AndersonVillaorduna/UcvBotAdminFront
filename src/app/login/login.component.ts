import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  animations: [
    trigger('fadeOut', [
      transition('in => out', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class LoginComponent {
  userName: string = '';
  password: string = '';
  isLoading: boolean = false;
  showError: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  fadeOut: 'in' | 'out' = 'in';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.showError = !this.userName || !this.password;
    if (this.showError) {
      console.warn('Campos vacíos');
      return;
    }

    this.isLoading = true;
    console.log('Enviando login...');

    this.http
      .post<any>('https://ucvbotbackend.onrender.com/api/admins/login', {
        v_userName: this.userName,
        v_password: this.password,
      })
      .subscribe({
        next: (response) => {
          console.log('Respuesta exitosa del backend:', response);

          this.isLoading = false;
          this.message = response.mensaje || 'Inicio de sesión exitoso';
          this.messageType = 'success';

          if (typeof window !== 'undefined' && localStorage) {
            localStorage.setItem('usuarioAdmin', JSON.stringify(response.user));
            console.log('Usuario guardado en localStorage:', response.user);
          }

          this.fadeOut = 'out'; // Activar animación
          console.log('Animación de salida activada (fadeOut = out)');
        },
        error: (error) => {
          console.error('Error del backend:', error);

          this.isLoading = false;
          this.messageType = 'error';
          this.message = error?.error?.mensaje || error.message || 'Error de conexión';
        },
      });
  }

  onFadeOutDone() {
    console.log('Animación completada, redirigiendo...');
    if (this.messageType === 'success') {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } else {
      console.warn('No se redirige porque el login falló');
    }
  }

  addCharacter(char: string) {
    if (this.password.length < 8) {
      this.password += char;
    }
  }

  deleteCharacter() {
    this.password = this.password.slice(0, -1);
  }

  clearInput() {
    this.password = '';
  }
}
