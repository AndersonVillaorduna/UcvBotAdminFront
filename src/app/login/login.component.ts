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
  imports: [CommonModule, FormsModule, RouterLink]
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

    this.http.post<any>('http://localhost:5000/api/admins/login', {
      v_userName: this.userName,
      v_password: this.password
    }).subscribe({
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
        this.message = error.error.mensaje || 'Error de conexión';
        this.messageType = 'error';
      }
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