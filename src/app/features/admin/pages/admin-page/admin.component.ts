import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../shared/models/user.model';
import { EditUserDialogComponent } from '../../components/edit-user-dialog/edit-user-dialog.component';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
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
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
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
