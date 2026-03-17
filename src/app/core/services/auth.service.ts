import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  private isAuthenticatedSignal = signal<boolean>(false);
  private currentUserSignal = signal<User | null>(null);

  // Mock users data
  private mockUsers = signal<User[]>([
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'Administrator', password: 'admin123' },
    { id: 2, username: 'john_doe', email: 'john@example.com', role: 'User', password: 'password' },
    { id: 3, username: 'jane_smith', email: 'jane@example.com', role: 'Manager', password: 'password' },
    { id: 4, username: 'bob_wilson', email: 'bob@example.com', role: 'User', password: 'password' },
    { id: 5, username: 'alice_brown', email: 'alice@example.com', role: 'Editor', password: 'password' },
  ]);

  constructor(private router: Router) {
    // Check if user was previously logged in (from localStorage)
    this.checkAuthStatus();
  }

  // Public getters
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  currentUser = this.currentUserSignal.asReadonly();
  users = this.mockUsers.asReadonly();

  /**
   * Login method - accepts any valid username and password
   */
  login(username: string, password: string): boolean {
    // Validate username (at least 3 characters, alphanumeric and underscore)
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!usernameRegex.test(username)) {
      return false;
    }

    // Validate password (at least 4 characters)
    if (!password || password.length < 4) {
      return false;
    }

    // Check if user already exists in mockUsers
    const existingUser = this.mockUsers().find(u => u.username === username);
    
    let user: User;
    
    if (existingUser) {
      // User exists - verify password
      if (existingUser.password !== password) {
        return false; // Wrong password
      }
      user = existingUser;
    } else {
      // New user - create and add to mockUsers
      const newId = this.mockUsers().length > 0 
        ? Math.max(...this.mockUsers().map(u => u.id)) + 1 
        : 1;
      
      user = {
        id: newId,
        username: username,
        email: `${username}@example.com`,
        role: 'Administrator',
        password: password
      };
      
      // Add new user to mockUsers
      this.mockUsers.set([...this.mockUsers(), user]);
    }

    this.isAuthenticatedSignal.set(true);
    this.currentUserSignal.set(user);
    
    // Store in localStorage for persistence (browser only)
    if (this.isBrowser) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Store updated users list
      localStorage.setItem('mockUsers', JSON.stringify(this.mockUsers()));
    }
    
    return true;
  }

  /**
   * Logout method - clears auth state and navigates to login
   */
  logout(): void {
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);
    
    // Clear localStorage (browser only)
    if (this.isBrowser) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
    }
    
    this.router.navigate(['/login']);
  }

  /**
   * Get all users (mock data for the listing page)
   */
  getUsers(): User[] {
    return this.mockUsers();
  }

  /**
   * Update user information
   */
  updateUser(updatedUser: User): boolean {
    const users = this.mockUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
      const newUsers = [...users];
      newUsers[index] = { ...updatedUser };
      this.mockUsers.set(newUsers);
      
      // Persist to localStorage
      if (this.isBrowser) {
        localStorage.setItem('mockUsers', JSON.stringify(newUsers));
      }
      
      return true;
    }
    return false;
  }

  /**
   * Delete user by ID
   */
  deleteUser(userId: number): boolean {
    const users = this.mockUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length < users.length) {
      this.mockUsers.set(filteredUsers);
      
      // Persist to localStorage
      if (this.isBrowser) {
        localStorage.setItem('mockUsers', JSON.stringify(filteredUsers));
      }
      
      return true;
    }
    return false;
  }

  /**
   * Add new user
   */
  addUser(user: Omit<User, 'id'>): User {
    const users = this.mockUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser: User = { ...user, id: newId };
    const newUsers = [...users, newUser];
    this.mockUsers.set(newUsers);
    
    // Persist to localStorage
    if (this.isBrowser) {
      localStorage.setItem('mockUsers', JSON.stringify(newUsers));
    }
    
    return newUser;
  }

  /**
   * Check authentication status from localStorage
   */
  private checkAuthStatus(): void {
    // Only check localStorage in browser environment
    if (!this.isBrowser) {
      return;
    }
    
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const userStr = localStorage.getItem('currentUser');
    const usersStr = localStorage.getItem('mockUsers');
    
    // Restore users list from localStorage if available
    if (usersStr) {
      try {
        const savedUsers = JSON.parse(usersStr);
        if (Array.isArray(savedUsers) && savedUsers.length > 0) {
          this.mockUsers.set(savedUsers);
        }
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    
    if (isAuth && userStr) {
      this.isAuthenticatedSignal.set(true);
      this.currentUserSignal.set(JSON.parse(userStr));
    }
  }
}
