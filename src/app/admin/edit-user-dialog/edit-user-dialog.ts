import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../core/auth/auth';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-user-dialog.html',
  styleUrl: './edit-user-dialog.css',
})
export class EditUserDialog {
  dialogRef = inject<MatDialogRef<EditUserDialog>>(MatDialogRef);
  data = inject<{ user: User }>(MAT_DIALOG_DATA);
  
  errorMessage = signal<string>('');
  editForm = {
    username: '',
    email: '',
    password: '',
    role: ''
  };

  constructor() {
    if (this.data.user) {
      this.editForm = {
        username: this.data.user.username,
        email: this.data.user.email,
        password: this.data.user.password || '',
        role: this.data.user.role
      };
    }
  }

  /**
   * Close the dialog
   */
  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Validate edit form fields
   */
  private validateForm(): string | null {
    const { username, email, password, role } = this.editForm;

    // Validate username
    if (!username || username.trim().length === 0) {
      return 'Username is required';
    }
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!usernameRegex.test(username.trim())) {
      return 'Username must be at least 3 characters (letters, numbers, underscore only)';
    }

    // Validate email
    if (!email || email.trim().length === 0) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }

    // Validate password
    if (!password || password.trim().length === 0) {
      return 'Password is required';
    }
    if (password.trim().length < 4) {
      return 'Password must be at least 4 characters';
    }

    // Validate role
    if (!role || role.trim().length === 0 || role === '') {
      return 'Please select a role';
    }
    const validRoles = ['Administrator', 'Manager', 'Editor', 'User'];
    if (!validRoles.includes(role)) {
      return 'Please select a valid role';
    }

    return null; // No errors
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (!this.data.user) return;

    // Validate form
    const validationError = this.validateForm();
    if (validationError) {
      this.errorMessage.set(validationError);
      return;
    }

    const updatedUser: User = {
      ...this.data.user,
      username: this.editForm.username.trim(),
      email: this.editForm.email.trim(),
      password: this.editForm.password.trim(),
      role: this.editForm.role
    };

    this.errorMessage.set('');
    this.dialogRef.close(updatedUser);
  }
}
