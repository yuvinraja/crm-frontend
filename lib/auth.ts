// Authentication utilities and context for Google OAuth integration

export interface User {
  _id: string;
  name: string;
  email: string;
  googleId?: string;
  provider: 'google' | 'local';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

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
      const response = await fetch(`${this.baseUrl}/auth/status`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return {
          user: data.user || null,
          isAuthenticated: data.isAuthenticated || false,
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
      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.user || null;
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
        method: 'POST',
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
