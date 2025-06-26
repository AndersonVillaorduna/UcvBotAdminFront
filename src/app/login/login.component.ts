import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
})
export class LoginComponent {
  userName: string = '';
  password: string = '';
  isLoading: boolean = false;
  showError: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';

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
          console.log('Usuario logueado:', response.user);
          if (typeof window !== 'undefined' && localStorage) {
            localStorage.setItem('usuarioAdmin', JSON.stringify(response.user));
          }
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          let messageToDisplay = 'Error de conexión';
          let typeOfMessage: 'success' | 'error' = 'error';

          // Check if the error object contains the success message in its body
          if (
            error &&
            typeof error.error === 'object' &&
            error.error !== null &&
            error.error.mensaje === 'Login exitoso'
          ) {
            messageToDisplay = error.error.mensaje;
            typeOfMessage = 'success'; // Treat as success if the message is 'Login exitoso'
            // Also, proceed with success actions if this is the case
            if (typeof window !== 'undefined' && localStorage) {
              localStorage.setItem(
                'usuarioAdmin',
                JSON.stringify(error.error.user)
              ); // Assuming user is also in error.error
            }
            this.router.navigate(['/dashboard']);
          } else if (
            error &&
            typeof error.error === 'object' &&
            error.error !== null &&
            error.error.mensaje
          ) {
            // Use the error message from the backend if available
            messageToDisplay = error.error.mensaje;
          } else if (error && typeof error.error === 'string') {
            // If error.error is a string, use it directly
            messageToDisplay = error.error;
          } else if (error && error.message) {
            // Fallback to error.message for generic HttpClient errors
            messageToDisplay = error.message;
          }

          this.message = messageToDisplay;
          this.messageType = typeOfMessage;
        },
      });
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
