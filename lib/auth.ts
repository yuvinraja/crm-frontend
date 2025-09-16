// Authentication utilities and context for Google OAuth integration
import { User } from './types';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

class AuthService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  async checkAuthStatus(): Promise<{
    user: User | null;
    isAuthenticated: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/user`, {
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        return {
          user: user || null,
          isAuthenticated: !!user,
        };
      }

      return { user: null, isAuthenticated: false };
    } catch (error) {
      console.error('Auth status check failed:', error);
      return { user: null, isAuthenticated: false };
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/user`, {
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        return user || null;
      }

      return null;
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return null;
    }
  }

  initiateGoogleLogin() {
    window.location.href = `${this.baseUrl}/auth/google`;
  }

  async logout(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
