import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, User } from '../core/auth/auth';
import { EditUserDialog } from './edit-user-dialog/edit-user-dialog';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  
  users = this.authService.users;
  currentUser = this.authService.currentUser;
  searchTerm = signal('');

  /**
   * Computed signal for filtered users based on search term
   */
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    
    if (!term) {
      return this.users();
    }
    
    return this.users().filter(user => 
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  });

  constructor() {}

  ngOnInit(): void {
    // Users are reactive via signal
  }

  /**
   * Handle logout action
   */
  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }

  /**
   * Open edit dialog for a user
   */
  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(EditUserDialog, {
      width: '500px',
      data: { user: { ...user } },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((result: User | undefined) => {
      if (result) {
        this.authService.updateUser(result);
      }
    });
  }

  /**
   * Delete a user
   */
  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.authService.deleteUser(user.id);
    }
  }
}

