import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  username = '';
  password = '';
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Redirect to admin if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  /**
   * Handle login form submission
   */
  onSubmit(): void {
    this.errorMessage.set('');
    
    if (!this.username || !this.password) {
      this.errorMessage.set('Please enter username and password');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!usernameRegex.test(this.username)) {
      this.errorMessage.set('Username must be at least 3 characters (letters, numbers, underscore only)');
      return;
    }

    // Validate password length
    if (this.password.length < 4) {
      this.errorMessage.set('Password must be at least 4 characters');
      return;
    }

    this.isLoading.set(true);

    // Simulate API call delay
    setTimeout(() => {
      const success = this.authService.login(this.username, this.password);
      
      if (success) {
        this.router.navigate(['/admin']);
      } else {
        this.errorMessage.set('Login failed. Please check your credentials.');
        this.password = ''; // Clear password on failed attempt
      }
      
      this.isLoading.set(false);
    }, 500);
  }
}

