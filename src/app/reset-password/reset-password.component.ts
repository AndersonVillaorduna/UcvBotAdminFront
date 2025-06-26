import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface PasswordStrength {
  class: string;
  text: string;
  score: number;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ResetPasswordComponent {
  userName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  showError: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  passwordStrength: PasswordStrength = { class: '', text: '', score: 0 };

    constructor(private http: HttpClient, private router: Router) {}

  // ... (resto de métodos igual que antes)

  // Getters para validaciones
  get isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  // Toggle visibility de contraseñas
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Calcular fuerza de contraseña
  onPasswordChange() {
    this.calculatePasswordStrength();
    this.clearMessage();
  }

  calculatePasswordStrength() {
    if (!this.password) {
      this.passwordStrength = { class: '', text: '', score: 0 };
      return;
    }
    
    let score = 0;
    let feedback: string[] = [];
    
    // Longitud
    if (this.password.length >= 8) {
      score += 2;
    } else if (this.password.length >= 6) {
      score += 1;
      feedback.push('Mínimo 8 caracteres');
    } else {
      feedback.push('Muy corta (mínimo 6)');
    }
    
    // Complejidad
    if (/[a-z]/.test(this.password)) score += 1;
    else feedback.push('Añade minúsculas');
    
    if (/[A-Z]/.test(this.password)) score += 1;
    else feedback.push('Añade mayúsculas');
    
    if (/[0-9]/.test(this.password)) score += 1;
    else feedback.push('Añade números');
    
    if (/[^A-Za-z0-9]/.test(this.password)) score += 1;
    else feedback.push('Añade símbolos');
    
    // Determinar clase y texto
    if (score <= 2) {
      this.passwordStrength = {
        class: 'weak',
        text: 'Contraseña débil' + (feedback.length ? ': ' + feedback.slice(0, 2).join(', ') : ''),
        score
      };
    } else if (score <= 4) {
      this.passwordStrength = {
        class: 'fair',
        text: 'Contraseña regular' + (feedback.length ? ': ' + feedback.slice(0, 1).join(', ') : ''),
        score
      };
    } else if (score <= 5) {
      this.passwordStrength = {
        class: 'good',
        text: 'Contraseña buena',
        score
      };
    } else {
      this.passwordStrength = {
        class: 'strong',
        text: 'Contraseña fuerte',
        score
      };
    }
  }

  // Validar formulario completo
  validateForm(): boolean {
    this.showError = false;
    let isValid = true;
    
    if (!this.userName) {
      this.showError = true;
      isValid = false;
    }
    
    if (!this.email) {
      this.showError = true;
      isValid = false;
    }
    
    if (!this.password) {
      this.showError = true;
      isValid = false;
    }

    if (!this.confirmPassword) {
      this.showError = true;
      isValid = false;
    }

    if (!isValid) {
      this.showMessage('Por favor, complete todos los campos', 'error');
      return false;
    }

    if (!this.isValidEmail) {
      this.showError = true;
      this.showMessage('Por favor, ingrese un email válido', 'error');
      return false;
    }

    if (this.userName.length < 3) {
      this.showMessage('El usuario debe tener al menos 3 caracteres', 'error');
      return false;
    }

    if (this.password.length < 6) {
      this.showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }

    if (!this.passwordsMatch) {
      this.showError = true;
      this.showMessage('Las contraseñas no coinciden', 'error');
      return false;
    }

    if (this.passwordStrength.score < 3) {
      this.showMessage('La contraseña es muy débil. Por favor, use una contraseña más segura', 'error');
      return false;
    }

    return true;
  }

  // Función principal de reset password
  resetPassword() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.clearMessage();

    const resetData = {
      userName: this.userName,
      email: this.email,
      password: this.password
    };

    // llamada HTTP
    this.http.put<any[]>(`http://localhost:5000/api/admins/reset`,{
      v_userName:this.userName,
      v_email:this.email,
      v_password:this.password
    })
    .subscribe({
      next: (response) => {
        console.log('Constraseña restablecida');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al restablecer contraseña:', error);
      }
    });
  }

  // Limpiar formulario
  clearForm() {
    this.userName = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.showError = false;
    this.passwordStrength = { class: '', text: '', score: 0 };
  }

  // Mostrar mensaje
  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    
    setTimeout(() => {
      this.clearMessage();
    }, 5000);
  }

  // Limpiar mensaje
  clearMessage() {
    this.message = '';
  }

  // ACTUALIZADA: Navegar al login
  goToLogin(event: Event) {
    event.preventDefault();
    
    try {
      // Navegar usando Angular Router
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al navegar:', error);
      
      // Fallback: navegación directa
      window.location.href = '/login';
    }
  }

  // Método para debugging
  onSubmit() {
    this.resetPassword();
  }
}