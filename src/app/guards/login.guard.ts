import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const usuario = localStorage.getItem('usuarioAdmin');
    if (usuario) {
      // Si ya está logueado, redirige al dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
  return true;
}
}
