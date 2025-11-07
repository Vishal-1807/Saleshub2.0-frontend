import { storageService } from './storage.service';
import { User } from '../types';

class AuthService {
  async login(email: string, password: string): Promise<User | null> {
    const user = storageService.getUserByEmail(email);

    if (user && user.password === password) {
      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        password: user.password
      };
    }

    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    const storedUser = localStorage.getItem('leadbyte_current_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  async setCurrentUser(user: User): Promise<void> {
    localStorage.setItem('leadbyte_current_user', JSON.stringify(user));
  }

  async logout(): Promise<void> {
    localStorage.removeItem('leadbyte_current_user');
  }
}

export const authService = new AuthService();
