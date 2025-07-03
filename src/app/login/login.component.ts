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

  fadeOut: 'in' | 'out' = 'in'; // Control de animación

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.showError = !this.userName || !this.password;
    if (this.showError) return;

    this.isLoading = true;

    this.http
      .post<any>('https://ucvbotbackend.onrender.com/api/admins/login', {
        v_userName: this.userName,
        v_password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.message = response.mensaje;
          this.messageType = 'success';

          // Guardar en localStorage
          if (typeof window !== 'undefined' && localStorage) {
            localStorage.setItem('usuarioAdmin', JSON.stringify(response.user));
          }

          // Mostrar mensaje y luego hacer fadeOut
          setTimeout(() => {
            this.fadeOut = 'out'; // activa animación
          }, 300);
        },
        error: (error) => {
          this.isLoading = false;
          let messageToDisplay = 'Error de conexión';
          let typeOfMessage: 'success' | 'error' = 'error';

          if (
            error &&
            typeof error.error === 'object' &&
            error.error !== null &&
            error.error.mensaje === 'Login exitoso'
          ) {
            messageToDisplay = error.error.mensaje;
            typeOfMessage = 'success';
            if (typeof window !== 'undefined' && localStorage) {
              localStorage.setItem('usuarioAdmin', JSON.stringify(error.error.user));
            }
            setTimeout(() => {
              this.fadeOut = 'out';
            }, 300);
          } else if (
            error &&
            typeof error.error === 'object' &&
            error.error !== null &&
            error.error.mensaje
          ) {
            messageToDisplay = error.error.mensaje;
          } else if (typeof error.error === 'string') {
            messageToDisplay = error.error;
          } else if (error.message) {
            messageToDisplay = error.message;
          }

          this.message = messageToDisplay;
          this.messageType = typeOfMessage;
        },
      });
  }

  // Se ejecuta cuando termina la animación
  onFadeOutDone() {
    this.router.navigate(['/dashboard']);
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
